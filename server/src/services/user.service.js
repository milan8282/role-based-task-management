import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

const checkObjectId = (id, label = "User") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

export const getAllUsersService = async () => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  return users;
};

export const getUserByIdService = async (userId) => {
  checkObjectId(userId);

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateUserRoleService = async ({ userId, role, currentUserId }) => {
  checkObjectId(userId);

  if (String(userId) === String(currentUserId)) {
    throw new ApiError(400, "Admin cannot change their own role");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save();

  return user.toSafeObject();
};

export const updateUserStatusService = async ({
  userId,
  isActive,
  currentUserId,
}) => {
  checkObjectId(userId);

  if (String(userId) === String(currentUserId)) {
    throw new ApiError(400, "Admin cannot deactivate their own account");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = isActive;
  await user.save();

  return user.toSafeObject();
};