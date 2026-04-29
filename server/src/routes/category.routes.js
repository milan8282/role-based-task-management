import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);

router.get("/", getCategories);

router.post(
  "/",
  authorizeRoles(ROLES.ADMIN),
  validate(createCategorySchema),
  createCategory
);

router.patch(
  "/:id",
  authorizeRoles(ROLES.ADMIN),
  validate(updateCategorySchema),
  updateCategory
);

router.delete("/:id", authorizeRoles(ROLES.ADMIN), deleteCategory);

export default router;