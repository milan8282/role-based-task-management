import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  clearAuthCookieOptions,
  getAuthCookieOptions,
} from "../utils/cookieOptions.js";
import {
  loginUserService,
  registerUserService,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerUserService(req.body);

  res
    .status(201)
    .cookie("accessToken", token, getAuthCookieOptions())
    .json(
      new ApiResponse(
        201,
        {
          user,
        },
        "Registered successfully"
      )
    );
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUserService(req.body);

  res
    .status(200)
    .cookie("accessToken", token, getAuthCookieOptions())
    .json(
      new ApiResponse(
        200,
        {
          user,
        },
        "Logged in successfully"
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken", clearAuthCookieOptions())
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "Current user fetched successfully"
    )
  );
});