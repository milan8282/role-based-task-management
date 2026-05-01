import express from "express";

import {
  createSavedFilter,
  deleteSavedFilter,
  getMySavedFilters,
} from "../controllers/savedFilter.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSavedFilterSchema,
  savedFilterIdSchema,
} from "../validators/savedFilter.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getMySavedFilters);
router.post("/", validate(createSavedFilterSchema), createSavedFilter);
router.delete("/:id", validate(savedFilterIdSchema), deleteSavedFilter);

export default router;