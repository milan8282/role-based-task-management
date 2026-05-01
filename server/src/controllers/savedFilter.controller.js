import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createSavedFilterService,
  deleteSavedFilterService,
  getMySavedFiltersService,
} from "../services/savedFilter.service.js";

export const createSavedFilter = asyncHandler(async (req, res) => {
  const savedFilter = await createSavedFilterService({
    currentUser: req.user,
    name: req.body.name,
    filters: req.body.filters,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { savedFilter }, "Filter saved successfully"));
});

export const getMySavedFilters = asyncHandler(async (req, res) => {
  const savedFilters = await getMySavedFiltersService({
    currentUser: req.user,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { savedFilters }, "Saved filters fetched successfully"));
});

export const deleteSavedFilter = asyncHandler(async (req, res) => {
  await deleteSavedFilterService({
    currentUser: req.user,
    filterId: req.params.id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Saved filter deleted successfully"));
});