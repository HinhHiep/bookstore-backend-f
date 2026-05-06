import Category from "./category.model.js";
import slugify from "slugify";
import { validateCreateCategory } from "./category.validator.js";

/**
 * 🔥 CREATE CATEGORY
 */
export const createCategory = async (data) => {
  // ✅ 1. Validate + normalize
  const validated = validateCreateCategory(data);

  const {
    name,
    parentId,
    description,
    image,
    sortOrder,
    isFeatured,
    keywords,
    tags,
  } = validated;

  // ✅ 2. Generate slug
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  // ✅ 3. Check duplicate slug
  const existing = await Category.findOne({ slug });
  if (existing) {
    const error = new Error("Slug already exists");
    error.status = 409;
    throw error;
  }

  // ✅ 4. Check parent (nếu có)
  let parent = null;

  if (parentId) {
    parent = await Category.findById(parentId);

    if (!parent) {
      const error = new Error("Parent category not found");
      error.status = 404;
      throw error;
    }
  }

  // ✅ 5. Create category
  const category = await Category.create({
    name,
    slug,
    description: description || "",
    parentId: parent ? parent._id : null,
    image: image || "",
    sortOrder: sortOrder ?? 0,
    isFeatured: isFeatured ?? false,
    keywords: keywords || [],
    tags: tags || [],
  });

  return category;
};

// Get list categories with pagination, filtering, sorting
export const getCategories = async (query) => {
  const {
    parentId,
    status,
    keyword,
    page = 1,
    limit = 10,
  } = query;

  // 🔥 build filter
  const filter = {};

  // parent filter
  if (parentId !== undefined) {
    if (parentId === "null") {
      filter.parentId = null;
    } else {
      filter.parentId = parentId;
    }
  }

  // status filter
  if (status) {
    filter.status = status;
  }

  // search theo name
  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" };
  }

  // 🔥 pagination
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // 🔥 query song song
  const [data, total] = await Promise.all([
    Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Category.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

/**
 * 📋 GET CATEGORY BY ID
 */
export const getCategoryById = async (id) => {
  const category = await Category.findById(id).lean();

  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }

  return category;
};

/**
 * 🌳 GET CHILDREN CATEGORIES
 * 
 */
export const getChildrenCategories = async (parentId) => {
  const children = await Category.find({ parentId })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return children;
};