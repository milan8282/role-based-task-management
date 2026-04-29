import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCommentService,
  deleteCommentService,
  getTaskCommentsService,
  updateCommentService,
} from "../services/comment.service.js";

export const createComment = asyncHandler(async (req, res) => {
  const comment = await createCommentService({
    taskId: req.params.taskId,
    message: req.body.message,
    currentUser: req.user,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

export const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await getTaskCommentsService({
    taskId: req.params.taskId,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { comments }, "Comments fetched successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await updateCommentService({
    commentId: req.params.id,
    message: req.body.message,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  await deleteCommentService({
    commentId: req.params.id,
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});