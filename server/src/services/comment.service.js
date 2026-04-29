import mongoose from "mongoose";
import Comment from "../models/Comment.model.js";
import Task from "../models/Task.model.js";
import ApiError from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import { createManyNotificationsService } from "./notification.service.js";
import { emitToTask } from "./socket.service.js";

const checkObjectId = (id, label = "resource") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

const canAccessTask = (task, currentUser) => {
  if (currentUser.role === ROLES.ADMIN) return true;

  const currentUserId = String(currentUser._id);

  const isCreator = String(task.createdBy?._id || task.createdBy) === currentUserId;

  const isAssigned = task.assignedTo?.some(
    (user) => String(user?._id || user) === currentUserId
  );

  return isCreator || isAssigned;
};

const getTaskParticipantsExceptCurrentUser = (task, currentUserId) => {
  const participants = new Set();

  if (task.createdBy) {
    participants.add(String(task.createdBy));
  }

  task.assignedTo?.forEach((userId) => {
    participants.add(String(userId));
  });

  participants.delete(String(currentUserId));

  return [...participants];
};

export const createCommentService = async ({ taskId, message, currentUser }) => {
  checkObjectId(taskId, "task");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(task, currentUser)) {
    throw new ApiError(403, "You do not have permission to comment on this task");
  }

  const comment = await Comment.create({
    task: taskId,
    user: currentUser._id,
    message,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "name email role")
    .populate("task", "title status");

  const recipients = getTaskParticipantsExceptCurrentUser(task, currentUser._id);

  if (recipients.length > 0) {
    await createManyNotificationsService(
      recipients.map((recipient) => ({
        recipient,
        sender: currentUser._id,
        task: task._id,
        type: NOTIFICATION_TYPES.TASK_COMMENTED,
        title: "New comment on task",
        message: `${currentUser.name} commented on "${task.title}"`,
      }))
    );
  }

  emitToTask(String(task._id), "comment:new", {
    comment: populatedComment,
  });

  return populatedComment;
};

export const getTaskCommentsService = async ({ taskId, currentUser }) => {
  checkObjectId(taskId, "task");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(task, currentUser)) {
    throw new ApiError(403, "You do not have permission to view comments");
  }

  const comments = await Comment.find({ task: taskId })
    .populate("user", "name email role")
    .sort({ createdAt: 1 });

  return comments;
};

export const updateCommentService = async ({
  commentId,
  message,
  currentUser,
}) => {
  checkObjectId(commentId, "comment");

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner = String(comment.user) === String(currentUser._id);

  if (!isOwner && currentUser.role !== ROLES.ADMIN) {
    throw new ApiError(403, "You can update only your own comment");
  }

  comment.message = message;
  await comment.save();

  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "name email role")
    .populate("task", "title status");

  emitToTask(String(comment.task), "comment:updated", {
    comment: populatedComment,
  });

  return populatedComment;
};

export const deleteCommentService = async ({ commentId, currentUser }) => {
  checkObjectId(commentId, "comment");

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner = String(comment.user) === String(currentUser._id);

  if (!isOwner && currentUser.role !== ROLES.ADMIN) {
    throw new ApiError(403, "You can delete only your own comment");
  }

  const taskId = String(comment.task);

  await comment.deleteOne();

  emitToTask(taskId, "comment:deleted", {
    commentId,
    taskId,
  });

  return true;
};