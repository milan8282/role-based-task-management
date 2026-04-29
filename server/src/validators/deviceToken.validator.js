import { z } from "zod";

export const saveDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string().trim().min(10, "Device token is required"),

    platform: z.enum(["web", "android", "ios"]).optional().default("web"),

    browser: z.string().trim().max(500).optional().default(""),
  }),
});

export const deleteDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string().trim().min(10, "Device token is required"),
  }),
});