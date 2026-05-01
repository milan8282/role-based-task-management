import mongoose from "mongoose";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import Category from "../models/Category.model.js";
import ApiError from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { TASK_STATUS } from "../constants/taskStatus.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import { createManyNotificationsService } from "./notification.service.js";
import { emitToTask, emitToUsers } from "./socket.service.js";

const checkObjectId = (id, label = "resource") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

const ensureCategoryExists = async (categoryId) => {
  checkObjectId(categoryId, "category");

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(404, "Category not found or inactive");
  }

  return category;
};

const ensureUsersExist = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(userIds.map(String))];

  uniqueIds.forEach((id) => checkObjectId(id, "user"));

  const users = await User.find({
    _id: { $in: uniqueIds },
    isActive: true,
  });

  if (users.length !== uniqueIds.length) {
    throw new ApiError(400, "One or more assigned users are invalid");
  }

  return uniqueIds;
};

const canAccessTask = (task, currentUser) => {
  if (currentUser.role === ROLES.ADMIN) return true;

  const currentUserId = String(currentUser._id);

  const isCreator =
    String(task.createdBy?._id || task.createdBy) === currentUserId;

  const isAssigned = task.assignedTo?.some(
    (user) => String(user?._id || user) === currentUserId
  );

  return isCreator || isAssigned;
};

const canDeleteTask = (task, currentUser) => {
  if (currentUser.role === ROLES.ADMIN) return true;

  return String(task.createdBy?._id || task.createdBy) === String(currentUser._id);
};

const getTaskParticipantIds = (task) => {
  const ids = new Set();

  if (task.createdBy) {
    ids.add(String(task.createdBy?._id || task.createdBy));
  }

  task.assignedTo?.forEach((user) => {
    ids.add(String(user?._id || user));
  });

  return [...ids];
};

const getNewAssigneeIds = (oldAssignees = [], newAssignees = []) => {
  const oldSet = new Set(oldAssignees.map((id) => String(id?._id || id)));

  return newAssignees
    .map((id) => String(id?._id || id))
    .filter((id) => !oldSet.has(id));
};

const getPopulatedTask = async (taskId) => {
  return Task.findById(taskId)
    .populate("category", "name description")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");
};

const emitTaskToParticipants = (task, event, payload) => {
  const participantIds = getTaskParticipantIds(task);

  emitToUsers(participantIds, event, payload);
  emitToTask(String(task._id), event, payload);
};

const notifyTaskAssigned = async ({ task, assigneeIds, currentUser }) => {
  const recipients = assigneeIds.filter(
    (id) => String(id) !== String(currentUser._id)
  );

  if (recipients.length === 0) return;

  await createManyNotificationsService(
    recipients.map((recipient) => ({
      recipient,
      sender: currentUser._id,
      task: task._id,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: "New task assigned",
      message: `${currentUser.name} assigned you a task: "${task.title}"`,
    }))
  );
};

const notifyTaskUpdated = async ({ task, currentUser }) => {
  const recipients = getTaskParticipantIds(task).filter(
    (id) => String(id) !== String(currentUser._id)
  );

  if (recipients.length === 0) return;

  await createManyNotificationsService(
    recipients.map((recipient) => ({
      recipient,
      sender: currentUser._id,
      task: task._id,
      type: NOTIFICATION_TYPES.TASK_UPDATED,
      title: "Task updated",
      message: `${currentUser.name} updated task: "${task.title}"`,
    }))
  );
};

const notifyTaskCompleted = async ({ task, currentUser }) => {
  const recipients = getTaskParticipantIds(task).filter(
    (id) => String(id) !== String(currentUser._id)
  );

  if (recipients.length === 0) return;

  await createManyNotificationsService(
    recipients.map((recipient) => ({
      recipient,
      sender: currentUser._id,
      task: task._id,
      type: NOTIFICATION_TYPES.TASK_COMPLETED,
      title: "Task completed",
      message: `${currentUser.name} marked "${task.title}" as completed`,
    }))
  );
};

export const createTaskService = async ({ data, currentUser }) => {
  await ensureCategoryExists(data.category);

  const assignedTo = await ensureUsersExist(data.assignedTo || []);

  const task = await Task.create({
    title: data.title,
    description: data.description,
    category: data.category,
    assignedTo,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    priority: data.priority || "medium",
    createdBy: currentUser._id,
  });

  if (assignedTo.length > 0) {
    await notifyTaskAssigned({
      task,
      assigneeIds: assignedTo,
      currentUser,
    });
  }

  const populatedTask = await getPopulatedTask(task._id);

  emitTaskToParticipants(task, "task:created", {
    task: populatedTask,
  });

  return populatedTask;
};

export const getTasksService = async ({ currentUser, filters = {} }) => {
  const query = {};

  if (currentUser.role !== ROLES.ADMIN) {
    query.$or = [{ createdBy: currentUser._id }, { assignedTo: currentUser._id }];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.category) {
    checkObjectId(filters.category, "category");
    query.category = filters.category;
  }

  if (filters.assignee) {
    checkObjectId(filters.assignee, "assignee");
    query.assignedTo = filters.assignee;
  }

  if (filters.dueFrom || filters.dueTo) {
    query.dueDate = {};

    if (filters.dueFrom) {
      query.dueDate.$gte = new Date(filters.dueFrom);
    }

    if (filters.dueTo) {
      query.dueDate.$lte = new Date(filters.dueTo);
    }
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");

    query.$and = [
      ...(query.$and || []),
      {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      },
    ];
  }

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const allowedSortFields = ["createdAt", "dueDate", "priority", "status", "title"];
  const sortBy = allowedSortFields.includes(filters.sortBy)
    ? filters.sortBy
    : "createdAt";

  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("category", "name description")
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getTaskByIdService = async ({ taskId, currentUser }) => {
  checkObjectId(taskId, "task");

  const task = await getPopulatedTask(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(task, currentUser)) {
    throw new ApiError(403, "You do not have permission to access this task");
  }

  return task;
};

export const updateTaskService = async ({ taskId, data, currentUser }) => {
  checkObjectId(taskId, "task");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(task, currentUser)) {
    throw new ApiError(403, "You do not have permission to update this task");
  }

  const oldAssignees = [...task.assignedTo];
  const oldStatus = task.status;

  if (data.category) {
    await ensureCategoryExists(data.category);
    task.category = data.category;
  }

  if (data.assignedTo) {
    if (
      currentUser.role !== ROLES.ADMIN &&
      String(task.createdBy) !== String(currentUser._id)
    ) {
      throw new ApiError(403, "Only task creator or admin can update assignees");
    }

    task.assignedTo = await ensureUsersExist(data.assignedTo);
  }

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.priority !== undefined) task.priority = data.priority;

  if (data.status !== undefined) {
    task.status = data.status;
    task.completedAt = data.status === TASK_STATUS.COMPLETED ? new Date() : null;
  }

  if (data.dueDate !== undefined) {
    task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    task.reminderSent = false;
  }

  await task.save();

  const newAssignees = getNewAssigneeIds(oldAssignees, task.assignedTo);

  if (newAssignees.length > 0) {
    await notifyTaskAssigned({
      task,
      assigneeIds: newAssignees,
      currentUser,
    });
  }

  if (
    oldStatus !== TASK_STATUS.COMPLETED &&
    task.status === TASK_STATUS.COMPLETED
  ) {
    await notifyTaskCompleted({ task, currentUser });
  } else {
    await notifyTaskUpdated({ task, currentUser });
  }

  const populatedTask = await getPopulatedTask(task._id);

  emitTaskToParticipants(task, "task:updated", {
    task: populatedTask,
  });

  return populatedTask;
};

export const deleteTaskService = async ({ taskId, currentUser }) => {
  checkObjectId(taskId, "task");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canDeleteTask(task, currentUser)) {
    throw new ApiError(403, "Only task creator or admin can delete this task");
  }

  const participantIds = getTaskParticipantIds(task);

  await task.deleteOne();

  emitToUsers(participantIds, "task:deleted", {
    taskId,
  });

  emitToTask(String(task._id), "task:deleted", {
    taskId,
  });

  return true;
};

export const getTasksGroupedByCategoryService = async ({ currentUser }) => {
  const match = {};

  if (currentUser.role !== ROLES.ADMIN) {
    match.$or = [
      { createdBy: new mongoose.Types.ObjectId(currentUser._id) },
      { assignedTo: new mongoose.Types.ObjectId(currentUser._id) },
    ];
  }

  const groupedTasks = await Task.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$category",
        category: { $first: "$categoryInfo.name" },
        totalTasks: { $sum: 1 },
        tasks: {
          $push: {
            _id: "$_id",
            title: "$title",
            description: "$description",
            status: "$status",
            priority: "$priority",
            dueDate: "$dueDate",
            createdBy: "$createdBy",
            assignedTo: "$assignedTo",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
      },
    },
    { $sort: { category: 1 } },
  ]);

  return groupedTasks;
};