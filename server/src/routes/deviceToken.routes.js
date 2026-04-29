import express from "express";

import {
  deleteDeviceToken,
  saveDeviceToken,
} from "../controllers/deviceToken.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  deleteDeviceTokenSchema,
  saveDeviceTokenSchema,
} from "../validators/deviceToken.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(saveDeviceTokenSchema), saveDeviceToken);
router.delete("/", validate(deleteDeviceTokenSchema), deleteDeviceToken);

export default router;