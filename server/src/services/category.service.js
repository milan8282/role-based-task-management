import mongoose from "mongoose";
import Category from "../models/Category.model.js";
import ApiError from "../utils/ApiError.js";

const checkObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category id");
  }
};

export const createCategoryService = async ({ name, description = "" }) => {
  const existingCategory = await Category.findOne({
    name: new RegExp(`^${name}$`, "i"),
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    description,
  });

  return category;
};

export const getCategoriesService = async () => {
  const categories = await Category.find().sort({ createdAt: -1 });

  return categories;
};

export const updateCategoryService = async ({ categoryId, data }) => {
  checkObjectId(categoryId);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (data.name) {
    const duplicate = await Category.findOne({
      _id: { $ne: categoryId },
      name: new RegExp(`^${data.name}$`, "i"),
    });

    if (duplicate) {
      throw new ApiError(409, "Category name already exists");
    }
  }

  Object.assign(category, data);
  await category.save();

  return category;
};

export const deleteCategoryService = async (categoryId) => {
  checkObjectId(categoryId);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();

  return true;
};