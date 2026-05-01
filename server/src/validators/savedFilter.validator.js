import { z } from "zod";
import { TASK_STATUS_VALUES } from "../constants/taskStatus.js";
import { TASK_PRIORITY_VALUES } from "../constants/taskPriority.js";

const optionalString = z.string().trim().optional().default("");

export const createSavedFilterSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Filter name must be at least 2 characters")
      .max(80, "Filter name cannot exceed 80 characters"),

    filters: z.object({
      status: z.enum(["", ...TASK_STATUS_VALUES]).optional().default(""),
      priority: z.enum(["", ...TASK_PRIORITY_VALUES]).optional().default(""),
      category: optionalString,
      assignee: optionalString,
      dueFrom: optionalString,
      dueTo: optionalString,
      search: optionalString,
      sortBy: z
        .enum(["createdAt", "dueDate", "priority", "status", "title"])
        .optional()
        .default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      pageSize: z.number().min(5).max(50).optional().default(10),
    }),
  }),
});

export const savedFilterIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid filter id"),
  }),
});
