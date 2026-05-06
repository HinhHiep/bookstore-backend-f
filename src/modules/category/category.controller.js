import * as categoryService from "./category.service.js";
import { validateObjectId } from "./category.validator.js";

/**
 * 🔥 CREATE CATEGORY
 * POST /api/categories
 * 
 * @description Tạo danh mục sách mới. Hỗ trợ cấu trúc cây danh mục (parent-child).
 * @use-case Quản trị viên thêm danh mục sách, ví dụ: "Văn học > Tiểu thuyết"
 * 
 * @request
 * {
 *   "name": "Tiểu thuyết",
 *   "parentId": "507f1f77bcf86cd799439011",  // Optional: ID danh mục cha
 *   "description": "Sách truyện dài...",
 *   "image": "https://example.com/image.jpg",
 *   "sortOrder": 1,
 *   "isFeatured": false,
 *   "keywords": ["tiểu thuyết", "novel"],
 *   "tags": ["fiction"]
 * }
 * 
 * @response 201: { status: "success", data: {...category with _id, timestamps} }
 * @errors
 *   - 400: Name required / Name > 200 chars / sortOrder invalid
 *   - 404: Parent category not found
 *   - 409: Slug already exists (duplicate name)
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error); // chuyển sang error middleware
  }
};

/**
 * 📦 GET CATEGORY LIST
 * GET /api/categories
 * 
 * @description Lấy danh sách danh mục với đầy đủ tính năng filter, sort, pagination.
 * Hỗ trợ tìm kiếm theo tên, parentId, status.
 * @use-case Hiển thị danh sách danh mục trên website, bộ lọc danh mục, sidebar navigation.
 * 
 * @query
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 *   - parentId: string (filter by parent category)
 *   - status: "active" | "inactive"
 *   - keyword: string (search by name)
 * 
 * @response 200: {
 *   status: "success",
 *   data: [{ _id, name, slug, parentId, level, status, ... }],
 *   pagination: { page, limit, total, totalPages }
 * }
 * @errors
 *   - 400: Invalid pagination params (page, limit must be positive numbers)
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📋 GET CATEGORY DETAIL
 * GET /api/categories/:id
 * 
 * @description Lấy thông tin chi tiết 1 danh mục theo ID.
 * @use-case Hiển thị trang chi tiết danh mục, breadcrumb navigation.
 * 
 * @pathParams
 *   - id: string (24-char MongoDB ObjectId)
 * 
 * @response 200: {
 *   status: "success",
 *   data: {
 *     _id, name, slug, description, parentId, ancestors, level,
 *     image, sortOrder, isFeatured, status, bookCount, keywords, tags,
 *     createdAt, updatedAt
 *   }
 * }
 * @errors
 *   - 400: Invalid ID format (not 24 hex chars)
 *   - 404: Category not found
 */
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ID format
    validateObjectId(id);

    // ✅ 2. Get category by ID
    const category = await categoryService.getCategoryById(id);

    return res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🌳 GET CHILDREN CATEGORIES
 * GET /api/categories/:id/children
 * 
 * @description Lấy tất cả danh mục con (direct children) của 1 danh mục cha.
 * @use-case Xây dựng tree navigation, hiển thị sub-categories dropdown.
 * Ví dụ: GET /api/categories/507f1f77bcf86cd799439011/children
 * => Trả lại [Tiểu thuyết, Truyện ngắn, Ngôn tình, Văn học Việt Nam] (con của "Văn học")
 * 
 * @pathParams
 *   - id: string (ID danh mục cha, 24-char ObjectId)
 * 
 * @response 200: {
 *   status: "success",
 *   data: [
 *     { _id, name, slug, parentId, level, bookCount, ... },
 *     { _id, name, slug, parentId, level, bookCount, ... }
 *   ]
 * }
 * @notes Danh sách sắp xếp theo sortOrder và createdAt, không có pagination.
 * @errors
 *   - 400: Invalid ID format
 *   - 404: Parent category not found
 */
export const getChildrenCategories = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate parent ID format
    validateObjectId(id);

    // ✅ 2. Verify parent category exists
    await categoryService.getCategoryById(id);

    // ✅ 3. Get all children categories
    const children = await categoryService.getChildrenCategories(id);

    return res.status(200).json({
      status: "success",
      data: children,
    });
  } catch (error) {
    next(error);
  }
};
