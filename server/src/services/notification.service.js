import mongoose from "mongoose";
import Notification from "../models/Notification.model.js";
import ApiError from "../utils/ApiError.js";
import { emitToUser } from "./socket.service.js";
import { sendPushToUserService } from "./push.service.js";

const checkObjectId = (id, label = "notification") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

const sendNotificationRealtimeAndPush = async (notification) => {
  emitToUser(String(notification.recipient), "notification:new", {
    notification,
  });

  await sendPushToUserService({
    userId: notification.recipient,
    title: notification.title,
    body: notification.message,
    data: {
      notificationId: notification._id,
      type: notification.type,
      taskId: notification.task?._id || notification.task || "",
    },
  });
};

export const createNotificationService = async ({
  recipient,
  sender = null,
  task = null,
  type,
  title,
  message,
}) => {
  if (!recipient) return null;

  const notification = await Notification.create({
    recipient,
    sender,
    task,
    type,
    title,
    message,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "name email role")
    .populate("task", "title status dueDate");

  await sendNotificationRealtimeAndPush(populatedNotification);

  return populatedNotification;
};

export const createManyNotificationsService = async (notifications = []) => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  const createdNotifications = await Notification.insertMany(notifications);

  const ids = createdNotifications.map((notification) => notification._id);

  const populatedNotifications = await Notification.find({ _id: { $in: ids } })
    .populate("sender", "name email role")
    .populate("task", "title status dueDate")
    .sort({ createdAt: -1 });

  await Promise.all(
    populatedNotifications.map((notification) =>
      sendNotificationRealtimeAndPush(notification)
    )
  );

  return populatedNotifications;
};

export const getMyNotificationsService = async ({ currentUser }) => {
  const notifications = await Notification.find({
    recipient: currentUser._id,
  })
    .populate("sender", "name email role")
    .populate("task", "title status dueDate")
    .sort({ createdAt: -1 });

  return notifications;
};

export const getUnreadNotificationCountService = async ({ currentUser }) => {
  const count = await Notification.countDocuments({
    recipient: currentUser._id,
    isRead: false,
  });

  return count;
};

export const markNotificationAsReadService = async ({
  notificationId,
  currentUser,
}) => {
  checkObjectId(notificationId);

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: currentUser._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  notification.readAt = new Date();

  await notification.save();

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "name email role")
    .populate("task", "title status dueDate");

  emitToUser(String(currentUser._id), "notification:read", {
    notification: populatedNotification,
  });

  return populatedNotification;
};

export const markAllNotificationsAsReadService = async ({ currentUser }) => {
  await Notification.updateMany(
    {
      recipient: currentUser._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  emitToUser(String(currentUser._id), "notification:all-read", {});

  return true;
};

export const deleteNotificationService = async ({
  notificationId,
  currentUser,
}) => {
  checkObjectId(notificationId);

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: currentUser._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.deleteOne();

  emitToUser(String(currentUser._id), "notification:deleted", {
    notificationId,
  });

  return true;
};