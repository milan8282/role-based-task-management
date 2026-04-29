import { z } from "zod";
import { ROLE_VALUES } from "../constants/roles.js";

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(ROLE_VALUES, {
      message: "Invalid role",
    }),
  }),

  params: z.object({
    id: z.string().min(1, "User id is required"),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({
      message: "isActive must be true or false",
    }),
  }),

  params: z.object({
    id: z.string().min(1, "User id is required"),
  }),
});