import express from "express";

import {
  createTask,
  deleteTask,
  exportTasksCsv,
  getTaskById,
  getTasks,
  getTasksGroupedByCategory,
  importTasksCsv,
  updateTask,
} from "../controllers/task.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { csvUpload } from "../middlewares/upload.middleware.js";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createTaskSchema), createTask);
router.get("/", getTasks);

router.get("/export", exportTasksCsv);
router.post("/import", csvUpload.single("file"), importTasksCsv);

router.get("/grouped-by-category", getTasksGroupedByCategory);
router.get("/:id", validate(taskIdSchema), getTaskById);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", validate(taskIdSchema), deleteTask);

export default router;