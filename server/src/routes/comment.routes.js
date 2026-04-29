import express from "express";

import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "../controllers/comment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  commentIdSchema,
  createCommentSchema,
  taskCommentsSchema,
  updateCommentSchema,
} from "../validators/comment.validator.js";

const router = express.Router();

router.use(protect);

router.post(
  "/tasks/:taskId/comments",
  validate(createCommentSchema),
  createComment
);

router.get(
  "/tasks/:taskId/comments",
  validate(taskCommentsSchema),
  getTaskComments
);

router.patch(
  "/comments/:id",
  validate(updateCommentSchema),
  updateComment
);

router.delete(
  "/comments/:id",
  validate(commentIdSchema),
  deleteComment
);

export default router;