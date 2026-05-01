import mongoose from "mongoose";
import SavedFilter from "../models/SavedFilter.model.js";
import ApiError from "../utils/ApiError.js";

const checkObjectId = (id, label = "saved filter") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
};

export const createSavedFilterService = async ({ currentUser, name, filters }) => {
  const existing = await SavedFilter.findOne({
    user: currentUser._id,
    name: new RegExp(`^${name}$`, "i"),
  });

  if (existing) {
    throw new ApiError(409, "Saved filter with this name already exists");
  }

  const savedFilter = await SavedFilter.create({
    user: currentUser._id,
    name,
    filters,
  });

  return savedFilter;
};

export const getMySavedFiltersService = async ({ currentUser }) => {
  return SavedFilter.find({ user: currentUser._id }).sort({ createdAt: -1 });
};

export const deleteSavedFilterService = async ({ currentUser, filterId }) => {
  checkObjectId(filterId);

  const savedFilter = await SavedFilter.findOne({
    _id: filterId,
    user: currentUser._id,
  });

  if (!savedFilter) {
    throw new ApiError(404, "Saved filter not found");
  }

  await savedFilter.deleteOne();

  return true;
};