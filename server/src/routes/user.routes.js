import express from "express";

import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/user.validator.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.ADMIN));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.patch("/:id/status", validate(updateUserStatusSchema), updateUserStatus);

export default router;