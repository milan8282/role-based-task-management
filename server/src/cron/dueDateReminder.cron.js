import cron from "node-cron";
import Task from "../models/Task.model.js";
import { TASK_STATUS } from "../constants/taskStatus.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import { createManyNotificationsService } from "../services/notification.service.js";

const getTaskParticipantIds = (task) => {
  const participants = new Set();

  if (task.createdBy) {
    participants.add(String(task.createdBy));
  }

  task.assignedTo?.forEach((userId) => {
    participants.add(String(userId));
  });

  return [...participants];
};

export const runDueDateReminderJob = async () => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await Task.find({
    status: { $ne: TASK_STATUS.COMPLETED },
    dueDate: {
      $ne: null,
      $gte: now,
      $lte: next24Hours,
    },
    reminderSent: false,
  });

  for (const task of tasks) {
    const recipients = getTaskParticipantIds(task);

    if (recipients.length > 0) {
      await createManyNotificationsService(
        recipients.map((recipient) => ({
          recipient,
          sender: null,
          task: task._id,
          type: NOTIFICATION_TYPES.DUE_DATE_REMINDER,
          title: "Task due soon",
          message: `"${task.title}" is due within 24 hours.`,
        }))
      );
    }

    task.reminderSent = true;
    await task.save();
  }
};

export const startDueDateReminderCron = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      await runDueDateReminderJob();
    } catch (error) {
      console.error("Due date reminder cron failed:", error.message);
    }
  });

  console.log("Due date reminder cron started");
};