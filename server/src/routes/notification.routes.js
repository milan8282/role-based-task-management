import express from "express";

import {
  deleteNotification,
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { notificationIdSchema } from "../validators/notification.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadNotificationCount);

router.patch("/mark-all-read", markAllNotificationsAsRead);

router.patch(
  "/:id/read",
  validate(notificationIdSchema),
  markNotificationAsRead
);

router.delete(
  "/:id",
  validate(notificationIdSchema),
  deleteNotification
);

export default router;