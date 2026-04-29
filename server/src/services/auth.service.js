import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/generateToken.js";

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateAccessToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is disabled. Please contact admin.");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAccessToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
};