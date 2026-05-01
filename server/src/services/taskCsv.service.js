import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import Category from "../models/Category.model.js";
import ApiError from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { TASK_STATUS_VALUES, TASK_STATUS } from "../constants/taskStatus.js";
import { TASK_PRIORITY_VALUES, TASK_PRIORITY } from "../constants/taskPriority.js";
import { buildCsv } from "../utils/csvBuilder.js";

const CSV_HEADERS = [
  "title",
  "description",
  "dueDate",
  "priority",
  "status",
  "category",
  "assignedUsers",
];

const ERROR_HEADERS = [
  "row",
  "title",
  "description",
  "dueDate",
  "priority",
  "status",
  "category",
  "assignedUsers",
  "reasons",
];

const normalize = (value) => String(value || "").trim();

const normalizeLower = (value) => normalize(value).toLowerCase();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatDateForCsv = (date) => {
  if (!date) return "";
  return new Date(date).toISOString();
};

const getBaseTaskQueryForUser = (currentUser) => {
  if (currentUser.role === ROLES.ADMIN) return {};

  return {
    $or: [{ createdBy: currentUser._id }, { assignedTo: currentUser._id }],
  };
};

const parseAssignedUsers = (value) => {
  const text = normalize(value);

  if (!text) return [];

  return text
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveCategory = async (categoryValue) => {
  const value = normalize(categoryValue);

  if (!value) return null;

  if (isValidObjectId(value)) {
    return Category.findOne({ _id: value, isActive: true });
  }

  return Category.findOne({
    name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    isActive: true,
  });
};

const resolveAssignedUsers = async (assignedUsersValue) => {
  const identifiers = parseAssignedUsers(assignedUsersValue);

  if (identifiers.length === 0) return [];

  const orQuery = identifiers.map((identifier) => {
    if (isValidObjectId(identifier)) {
      return { _id: identifier };
    }

    return {
      $or: [
        { email: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        { name: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      ],
    };
  });

  const users = await User.find({
    isActive: true,
    $or: orQuery,
  }).select("_id name email");

  if (users.length !== identifiers.length) {
    return {
      ok: false,
      users: [],
      reason: "One or more assigned users were not found or inactive",
    };
  }

  return {
    ok: true,
    users: users.map((user) => user._id),
  };
};

const validateDueDate = (value) => {
  const dueDateText = normalize(value);

  if (!dueDateText) return { ok: true, value: null };

  const date = new Date(dueDateText);

  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      reason: "Invalid dueDate format. Use ISO format like 2026-05-10T10:00:00.000Z",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return {
      ok: false,
      reason: "Due date cannot be in the past",
    };
  }

  return {
    ok: true,
    value: date,
  };
};

export const exportTasksCsvService = async ({ currentUser, filters = {} }) => {
  const query = getBaseTaskQueryForUser(currentUser);

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  if (filters.assignee) query.assignedTo = filters.assignee;

  if (filters.dueFrom || filters.dueTo) {
    query.dueDate = {};

    if (filters.dueFrom) query.dueDate.$gte = new Date(filters.dueFrom);
    if (filters.dueTo) query.dueDate.$lte = new Date(filters.dueTo);
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");

    query.$and = [
      ...(query.$and || []),
      {
        $or: [{ title: searchRegex }, { description: searchRegex }],
      },
    ];
  }

  const tasks = await Task.find(query)
    .populate("category", "name")
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  const rows = tasks.map((task) => ({
    title: task.title,
    description: task.description,
    dueDate: formatDateForCsv(task.dueDate),
    priority: task.priority || TASK_PRIORITY.MEDIUM,
    status: task.status,
    category: task.category?.name || "",
    assignedUsers:
      task.assignedTo?.map((user) => user.email || user.name).join(";") || "",
  }));

  return buildCsv(CSV_HEADERS, rows);
};

export const importTasksCsvService = async ({ fileBuffer, currentUser }) => {
  if (!fileBuffer) {
    throw new ApiError(400, "CSV file is required");
  }

  let records = [];

  try {
    records = parse(fileBuffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    throw new ApiError(400, "Unable to parse CSV file. Please check CSV format.");
  }

  if (records.length === 0) {
    throw new ApiError(400, "CSV file is empty");
  }

  if (records.length > 500) {
    throw new ApiError(400, "Maximum 500 tasks are allowed per import");
  }

  const existingTasks = await Task.find({}).select("title");
  const existingTitles = new Set(
    existingTasks.map((task) => normalizeLower(task.title))
  );

  const csvTitles = new Set();
  const successRows = [];
  const errorRows = [];

  for (let index = 0; index < records.length; index += 1) {
    const rowNumber = index + 2;
    const row = records[index];

    const title = normalize(row.title);
    const description = normalize(row.description);
    const status = normalizeLower(row.status) || TASK_STATUS.TODO;
    const priority = normalizeLower(row.priority) || TASK_PRIORITY.MEDIUM;

    const reasons = [];

    if (!title) {
      reasons.push("Title is required");
    }

    if (title && title.length < 2) {
      reasons.push("Title must be at least 2 characters");
    }

    if (title && title.length > 100) {
      reasons.push("Title cannot exceed 100 characters");
    }

    if (!description) {
      reasons.push("Description is required");
    }

    if (description && description.length < 2) {
      reasons.push("Description must be at least 2 characters");
    }

    if (description && description.length > 2000) {
      reasons.push("Description cannot exceed 2000 characters");
    }

    if (!TASK_STATUS_VALUES.includes(status)) {
      reasons.push(`Invalid status. Allowed: ${TASK_STATUS_VALUES.join(", ")}`);
    }

    if (!TASK_PRIORITY_VALUES.includes(priority)) {
      reasons.push(`Invalid priority. Allowed: ${TASK_PRIORITY_VALUES.join(", ")}`);
    }

    const titleKey = normalizeLower(title);

    if (titleKey && existingTitles.has(titleKey)) {
      reasons.push("Duplicate task title already exists");
    }

    if (titleKey && csvTitles.has(titleKey)) {
      reasons.push("Duplicate task title inside CSV");
    }

    const dueDateValidation = validateDueDate(row.dueDate);

    if (!dueDateValidation.ok) {
      reasons.push(dueDateValidation.reason);
    }

    const category = await resolveCategory(row.category);

    if (!category) {
      reasons.push("Category is required and must match an active category name or id");
    }

    const assignedUserResult = await resolveAssignedUsers(row.assignedUsers);

    if (assignedUserResult.ok === false) {
      reasons.push(assignedUserResult.reason);
    }

    if (reasons.length > 0) {
      errorRows.push({
        row: rowNumber,
        title: row.title || "",
        description: row.description || "",
        dueDate: row.dueDate || "",
        priority: row.priority || "",
        status: row.status || "",
        category: row.category || "",
        assignedUsers: row.assignedUsers || "",
        reasons: reasons.join(" | "),
      });

      continue;
    }

    csvTitles.add(titleKey);

    successRows.push({
      title,
      description,
      category: category._id,
      assignedTo: assignedUserResult.users || [],
      dueDate: dueDateValidation.value,
      priority,
      status,
      createdBy: currentUser._id,
      completedAt: status === TASK_STATUS.COMPLETED ? new Date() : null,
    });
  }

  let insertedTasks = [];

  if (successRows.length > 0) {
    insertedTasks = await Task.insertMany(successRows);
  }

  const errorReportCsv =
    errorRows.length > 0 ? buildCsv(ERROR_HEADERS, errorRows) : "";

  return {
    insertedCount: insertedTasks.length,
    failedCount: errorRows.length,
    totalRows: records.length,
    errorReportCsv,
  };
};