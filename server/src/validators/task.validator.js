import { z } from "zod";
import { TASK_STATUS_VALUES } from "../constants/taskStatus.js";

const objectIdMessage = "Invalid id";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, objectIdMessage);

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Task title must be at least 2 characters")
      .max(100, "Task title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(2, "Task description must be at least 2 characters")
      .max(2000, "Task description cannot exceed 2000 characters"),

    category: objectIdSchema,

    assignedTo: z.array(objectIdSchema).optional().default([]),

    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Task title must be at least 2 characters")
      .max(100, "Task title cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(2, "Task description must be at least 2 characters")
      .max(2000, "Task description cannot exceed 2000 characters")
      .optional(),

    category: objectIdSchema.optional(),

    status: z.enum(TASK_STATUS_VALUES).optional(),

    assignedTo: z.array(objectIdSchema).optional(),

    dueDate: z.string().datetime().optional().nullable(),
  }),

  params: z.object({
    id: objectIdSchema,
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});