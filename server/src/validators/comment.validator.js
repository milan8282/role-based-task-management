import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createCommentSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(1, "Comment message is required")
      .max(1000, "Comment cannot exceed 1000 characters"),
  }),

  params: z.object({
    taskId: objectIdSchema,
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(1, "Comment message is required")
      .max(1000, "Comment cannot exceed 1000 characters"),
  }),

  params: z.object({
    id: objectIdSchema,
  }),
});

export const commentIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const taskCommentsSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
});