import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  updateUserStatusService,
} from "../services/user.service.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();

  res
    .status(200)
    .json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await getUserByIdService(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await updateUserRoleService({
    userId: req.params.id,
    role: req.body.role,
    currentUserId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User role updated successfully"));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await updateUserStatusService({
    userId: req.params.id,
    isActive: req.body.isActive,
    currentUserId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User status updated successfully"));
});