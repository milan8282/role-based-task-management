import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../services/category.service.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await createCategoryService(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, { category }, "Category created successfully"));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await getCategoriesService();

  res
    .status(200)
    .json(new ApiResponse(200, { categories }, "Categories fetched successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await updateCategoryService({
    categoryId: req.params.id,
    data: req.body,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { category }, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await deleteCategoryService(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});