import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createTaskService,
  deleteTaskService,
  getTaskByIdService,
  getTasksGroupedByCategoryService,
  getTasksService,
  updateTaskService,
} from "../services/task.service.js";
import {
  exportTasksCsvService,
  importTasksCsvService,
} from "../services/taskCsv.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService({
    data: req.body,
    currentUser: req.user,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await getTasksService({
    currentUser: req.user,
    filters: {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority,
      assignee: req.query.assignee,
      dueFrom: req.query.dueFrom,
      dueTo: req.query.dueTo,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      page: req.query.page,
      limit: req.query.limit,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks fetched successfully"));
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await getTaskByIdService({
    taskId: req.params.id,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService({
    taskId: req.params.id,
    data: req.body,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskService({
    taskId: req.params.id,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const getTasksGroupedByCategory = asyncHandler(async (req, res) => {
  const groupedTasks = await getTasksGroupedByCategoryService({
    currentUser: req.user,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { groupedTasks },
      "Tasks grouped by category fetched successfully"
    )
  );
});

export const exportTasksCsv = asyncHandler(async (req, res) => {
  const csv = await exportTasksCsvService({
    currentUser: req.user,
    filters: {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority,
      assignee: req.query.assignee,
      dueFrom: req.query.dueFrom,
      dueTo: req.query.dueTo,
      search: req.query.search,
    },
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=tasks.csv");

  res.status(200).send(csv);
});

export const importTasksCsv = asyncHandler(async (req, res) => {
  const result = await importTasksCsvService({
    fileBuffer: req.file?.buffer,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "CSV import processed successfully"));
});