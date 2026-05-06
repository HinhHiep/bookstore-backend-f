import * as bookService from "./book.service.js";
import { validateObjectId } from "./book.validator.js";

/**
 * 🔥 CREATE BOOK
 * POST /api/books
 * 
 * @description Tạo sách mới trong hệ thống. Auto-generate slug từ title.
 * @use-case Thêm sách mới vào kho, nhập khẩu sách từ nhà cung cấp.
 * 
 * @request {
 *   "title": "Clean Code",
 *   "author": "Robert C. Martin",
 *   "categoryId": "507f1f77bcf86cd799439011",
 *   "price": 299000,
 *   "discountPrice": 249000,
 *   "quantity": 50
 * }
 * 
 * @response 201: { status: "success", data: { _id, title, slug, ... } }
 * @errors 400: Title/Author required | 404: Category not found | 409: Slug exists
 */
export const createBook = async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);

    return res.status(201).json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * � GET ALL BOOKS (LIST)
 * GET /api/books?page=1&limit=10&sort=price&categoryId=...
 * 
 * @description Lấy danh sách sách với phân trang, lọc, sắp xếp.
 * @use-case Hiển thị danh sách sách trên trang chủ, tìm kiếm theo danh mục, tác giả.
 * 
 * @query {
 *   "page": 1 (default),
 *   "limit": 10 (default),
 *   "sort": "price,-sold" (ascending/descending),
 *   "categoryId": "507f1f77bcf86cd799439011" (optional),
 *   "author": "Robert C. Martin" (optional),
 *   "minPrice": 100000, "maxPrice": 500000 (optional),
 *   "status": "active" (optional)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, price, ... }], total: 25, page: 1, pages: 3 }
 * @errors 400: Invalid query params | 500: Database error
 */
export const getBooks = async (req, res, next) => {
  try {
    const result = await bookService.getBooks(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * � GET BOOK DETAIL
 * GET /api/books/:id
 * 
 * @description Lấy thông tin chi tiết 1 sách (title, price, rating, review, category, ...).
 * @use-case Hiển thị trang chi tiết sách, xem đánh giá, reviews của 1 sách.
 * 
 * @pathParams {
 *   "id": "507f1f77bcf86cd799439011" (MongoDB ObjectId)
 * }
 * 
 * @response 200: { status: "success", data: { _id, title, slug, price, discountPrice, rating, reviewCount, categoryId, ... } }
 * @errors 400: Invalid ID format | 404: Book not found | 500: Database error
 */
export const getBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ID
    validateObjectId(id);

    // ✅ 2. Get book
    const book = await bookService.getBookById(id);

    return res.status(200).json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✏️ UPDATE BOOK
 * PATCH /api/books/:id
 * 
 * @description Cập nhật thông tin sách (title, price, discount, quantity, status, ...).
 * @use-case Sửa giá sách, cập nhật tồn kho, chuyển trạng thái, thay ảnh.
 * 
 * @pathParams {
 *   "id": "507f1f77bcf86cd799439011" (MongoDB ObjectId)
 * }
 * 
 * @request {
 *   "title": "Clean Code - Updated",
 *   "price": 319000,
 *   "quantity": 45,
 *   "status": "active" (optional: active/inactive)
 * }
 * 
 * @response 200: { status: "success", data: { _id, title, slug, price, ... } }
 * @errors 400: Invalid ID | 404: Book not found | 422: Validation failed | 500: Database error
 */
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ID
    validateObjectId(id);

    // ✅ 2. Update book
    const book = await bookService.updateBook(id, req.body);

    return res.status(200).json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🗑️ DELETE BOOK
 * DELETE /api/books/:id
 * 
 * @description Xóa sách khỏi hệ thống (hard delete).
 * @use-case Xóa sách lỗi, sách không bán được, dọn dẹp database.
 * 
 * @pathParams {
 *   "id": "507f1f77bcf86cd799439011" (MongoDB ObjectId)
 * }
 * 
 * @response 200: { status: "success", message: "Book deleted successfully" }
 * @errors 400: Invalid ID | 404: Book not found | 500: Database error
 */
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ID
    validateObjectId(id);

    // ✅ 2. Delete book
    await bookService.deleteBook(id);

    return res.status(200).json({
      status: "success",
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * � GET TOP BOOKS (BESTSELLERS)
 * GET /api/books/top?limit=10&sortBy=sold
 * 
 * @description Lấy top sách bán chạy nhất, được đánh giá cao nhất.
 * @use-case Hiển thị gợi ý hot, sách trending, bestseller trên homepage.
 * 
 * @query {
 *   "limit": 10 (default),
 *   "sortBy": "sold|rating|createdAt" (default: sold)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, sold, rating, price, ... }] }
 * @errors 400: Invalid limit | 500: Database error
 */
export const getTopBooks = async (req, res, next) => {
  try {
    const books = await bookService.getTopBooks(req.query);

    return res.status(200).json({
      status: "success",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔍 SEARCH BOOKS (FULL-TEXT SEARCH)
 * GET /api/books/search?keyword=clean+code&limit=20
 * 
 * @description Tìm kiếm sách theo từ khóa trong title, author, description (full-text).
 * @use-case Người dùng nhập từ khóa tìm kiếm, autocomplete, search bar.
 * 
 * @query {
 *   "keyword": "clean code" (required, min 2 chars),
 *   "limit": 20 (default: 10)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, author, price, relevance, ... }] }
 * @errors 400: Keyword required | Invalid limit | 500: Search error
 */
export const searchBooks = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    if (!keyword || keyword.trim().length === 0) {
      const error = new Error("Keyword is required");
      error.status = 400;
      throw error;
    }

    const books = await bookService.searchBooks(keyword, limit);

    return res.status(200).json({
      status: "success",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🤝 GET RELATED BOOKS
 * GET /api/books/:id/related?limit=6
 * 
 * @description Lấy danh sách sách liên quan (cùng danh mục, tác giả, thể loại).
 * @use-case Gợi ý sản phẩm liên quan trên trang chi tiết sách, "Bạn có thể thích".
 * 
 * @pathParams {
 *   "id": "507f1f77bcf86cd799439011" (MongoDB ObjectId)
 * }
 * 
 * @query {
 *   "limit": 6 (default)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, categoryId, rating, price, ... }] }
 * @errors 400: Invalid ID | 404: Book not found | 500: Database error
 */
export const getRelatedBooks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    validateObjectId(id);

    const books = await bookService.getRelatedBooks(id, limit);

    return res.status(200).json({
      status: "success",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ GET AVAILABLE BOOKS (IN STOCK)
 * GET /api/books/available?page=1&limit=10&categoryId=...
 * 
 * @description Lấy danh sách sách còn hàng (quantity > 0) với phân trang.
 * @use-case Hiển thị sách có sẵn, lọc theo danh mục, tác giả.
 * 
 * @query {
 *   "page": 1 (default),
 *   "limit": 10 (default),
 *   "categoryId": "507f1f77bcf86cd799439011" (optional),
 *   "author": "Robert C. Martin" (optional)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, quantity, price, ... }], total: 45, page: 1, pages: 5 }
 * @errors 400: Invalid page/limit | 500: Database error
 */
export const getAvailableBooks = async (req, res, next) => {
  try {
    const result = await bookService.getAvailableBooks(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ⭐ GET FEATURED BOOKS
 * GET /api/books/featured?limit=8
 * 
 * @description Lấy danh sách sách được nổi bật (isFeatured = true).
 * @use-case Hiển thị sách nổi bật, sách được quảng cáo trên homepage.
 * 
 * @query {
 *   "limit": 8 (default)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, isFeatured, price, rating, ... }] }
 * @errors 400: Invalid limit | 500: Database error
 */
export const getFeaturedBooks = async (req, res, next) => {
  try {
    const { limit } = req.query;

    const books = await bookService.getFeaturedBooks(limit);

    return res.status(200).json({
      status: "success",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🆕 GET NEW BOOKS
 * GET /api/books/new?page=1&limit=10&days=30
 * 
 * @description Lấy danh sách sách mới phát hành (trong N ngày gần đây).
 * @use-case Hiển thị phiên bản mới, sách vừa ra mắt, tính năng "Newest".
 * 
 * @query {
 *   "page": 1 (default),
 *   "limit": 10 (default),
 *   "days": 30 (default, sách trong vòng 30 ngày gần đây)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, createdAt, price, ... }], total: 15, page: 1, pages: 2 }
 * @errors 400: Invalid page/limit/days | 500: Database error
 */
export const getNewBooks = async (req, res, next) => {
  try {
    const result = await bookService.getNewBooks(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🏷️ GET DISCOUNT BOOKS (ON SALE)
 * GET /api/books/discount?page=1&limit=10&minDiscount=10
 * 
 * @description Lấy danh sách sách đang giảm giá (discountPrice < price).
 * @use-case Hiển thị sách sale, khuyến mãi, "Flash Sale" banner.
 * 
 * @query {
 *   "page": 1 (default),
 *   "limit": 10 (default),
 *   "minDiscount": 10 (default: tối thiểu 10% off)
 * }
 * 
 * @response 200: { status: "success", data: [{ _id, title, price, discountPrice, savingAmount, ... }], total: 25, page: 1, pages: 3 }
 * @errors 400: Invalid query params | 500: Database error
 */
export const getDiscountBooks = async (req, res, next) => {
  try {
    const result = await bookService.getDiscountBooks(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 💰 GET BOOK WITH DISCOUNT INFO (CHI TIẾT GIÁ)
 * GET /api/books/:id/discount-info
 * 
 * @description Lấy thông tin sách kèm % giảm giá, số tiền tiết kiệm.
 * @use-case Hiển thị % giảm giá, tiết kiệm bao nhiêu trên sách chi tiết.
 * 
 * @pathParams {
 *   "id": "507f1f77bcf86cd799439011" (MongoDB ObjectId)
 * }
 * 
 * @response 200: { status: "success", data: { _id, title, price, discountPrice, discountPercentage: 15, savingAmount: 45000, ... } }
 * @errors 400: Invalid ID | 404: Book not found | 500: Database error
 */
export const getBookWithDiscountInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const book = await bookService.getBookWithDiscountInfo(id);

    return res.status(200).json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📊 GET BOOKS STATISTICS (DASHBOARD)
 * GET /api/books/stats
 * 
 * @description Lấy thống kê chung về sách: tổng số, bán được, tồn kho, rating trung bình.
 * @use-case Hiển thị dashboard, báo cáo, khách hàng xem thống kê nhà sách.
 * 
 * @response 200: {
 *   status: "success",
 *   data: {
 *     totalBooks: 150,
 *     totalSold: 5230,
 *     totalInventory: 3450,
 *     avgRating: 4.5,
 *     totalRevenue: 1250000000,
 *     byCategory: [{ _id, count, revenue }],
 *     byRating: [{ _id, count }],
 *     topGenres: [...]
 *   }
 * }
 * @errors 500: Database error
 */
export const getBookStatistics = async (req, res, next) => {
  try {
    const stats = await bookService.getBookStatistics();

    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
