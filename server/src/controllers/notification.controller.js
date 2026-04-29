import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteNotificationService,
  getMyNotificationsService,
  getUnreadNotificationCountService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
} from "../services/notification.service.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await getMyNotificationsService({
    currentUser: req.user,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { notifications },
      "Notifications fetched successfully"
    )
  );
});

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const unreadCount = await getUnreadNotificationCountService({
    currentUser: req.user,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { unreadCount },
      "Unread notification count fetched successfully"
    )
  );
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationAsReadService({
    notificationId: req.params.id,
    currentUser: req.user,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { notification },
      "Notification marked as read"
    )
  );
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await markAllNotificationsAsReadService({
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await deleteNotificationService({
    notificationId: req.params.id,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});