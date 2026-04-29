import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteDeviceTokenService,
  saveDeviceTokenService,
} from "../services/deviceToken.service.js";

export const saveDeviceToken = asyncHandler(async (req, res) => {
  const deviceToken = await saveDeviceTokenService({
    currentUser: req.user,
    token: req.body.token,
    platform: req.body.platform,
    browser: req.body.browser,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { deviceToken },
      "Device token saved successfully"
    )
  );
});

export const deleteDeviceToken = asyncHandler(async (req, res) => {
  await deleteDeviceTokenService({
    currentUser: req.user,
    token: req.body.token,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Device token removed successfully"));
});