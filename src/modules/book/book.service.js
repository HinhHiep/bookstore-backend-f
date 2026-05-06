import Book from "./book.model.js";
import Category from "../category/category.model.js";
import slugify from "slugify";
import { validateCreateBook } from "./book.validator.js";

/**
 * 🔥 CREATE BOOK
 */
export const createBook = async (data) => {
  // ✅ 1. Validate + normalize
  const validated = validateCreateBook(data);

  const {
    title,
    author,
    categoryId,
    description,
    isbn,
    price,
    discountPrice,
    quantity,
    coverImage,
    images,
    publisher,
    publishedDate,
    pages,
    language,
    edition,
    format,
    keywords,
    tags,
  } = validated;

  // ✅ 2. Generate slug
  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  // ✅ 3. Check duplicate slug
  const existing = await Book.findOne({ slug });
  if (existing) {
    const error = new Error("Slug already exists");
    error.status = 409;
    throw error;
  }

  // ✅ 4. Check duplicate ISBN (if provided)
  if (isbn) {
    const existingIsbn = await Book.findOne({ isbn });
    if (existingIsbn) {
      const error = new Error("ISBN already exists");
      error.status = 409;
      throw error;
    }
  }

  // ✅ 5. Check category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }

  // ✅ 6. Create book
  const book = await Book.create({
    title,
    slug,
    author,
    description: description || "",
    isbn: isbn || null,
    categoryId,
    price,
    discountPrice: discountPrice || null,
    quantity: quantity ?? 0,
    coverImage: coverImage || "",
    images: images || [],
    publisher: publisher || "",
    publishedDate: publishedDate || null,
    pages: pages || null,
    language: language || "VI",
    edition: edition || "",
    format: format || "paperback",
    keywords: keywords || [],
    tags: tags || [],
  });

  return book;
};

/**
 * 📦 GET BOOKS LIST
 */
export const getBooks = async (query) => {
  const {
    categoryId,
    status,
    isFeatured,
    isNew,
    isDiscount,
    keyword,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = -1,
  } = query;

  // 🔥 build filter
  const filter = {};

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (status) {
    filter.status = status;
  }

  if (isFeatured === "true") {
    filter.isFeatured = true;
  }

  if (isNew === "true") {
    filter.isNew = true;
  }

  if (isDiscount === "true") {
    filter.isDiscount = true;
  }

  // search theo title, author, keywords
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { author: { $regex: keyword, $options: "i" } },
      { keywords: { $in: [new RegExp(keyword, "i")] } },
    ];
  }

  // 🔥 pagination
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // 🔥 sorting
  const sortObj = {};
  sortObj[sortBy] = parseInt(sortOrder) || -1;

  // 🔥 query song song
  const [data, total] = await Promise.all([
    Book.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .populate("categoryId", "name slug")
      .lean(),

    Book.countDocuments(filter),
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
 * 📋 GET BOOK BY ID
 */
export const getBookById = async (id) => {
  const book = await Book.findById(id)
    .populate("categoryId", "name slug description image")
    .lean();

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  return book;
};

/**
 * 🔄 UPDATE BOOK
 */
export const updateBook = async (id, data) => {
  // ✅ 1. Check book exists
  const book = await Book.findById(id);
  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  // ✅ 2. Check slug uniqueness (if title changed)
  if (data.title && data.title !== book.title) {
    const slug = slugify(data.title, {
      lower: true,
      strict: true,
    });

    const existing = await Book.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      const error = new Error("Slug already exists");
      error.status = 409;
      throw error;
    }

    data.slug = slug;
  }

  // ✅ 3. Check ISBN uniqueness (if ISBN changed)
  if (data.isbn && data.isbn !== book.isbn) {
    const existing = await Book.findOne({ isbn: data.isbn, _id: { $ne: id } });
    if (existing) {
      const error = new Error("ISBN already exists");
      error.status = 409;
      throw error;
    }
  }

  // ✅ 4. Validate discount price
  const price = data.price || book.price;
  const discountPrice = data.discountPrice || book.discountPrice;

  if (discountPrice && discountPrice >= price) {
    const error = new Error("Discount price must be less than original price");
    error.status = 400;
    throw error;
  }

  // ✅ 5. Update book
  const updated = await Book.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate("categoryId", "name slug")
    .lean();

  return updated;
};

/**
 * 🗑️ DELETE BOOK
 */
export const deleteBook = async (id) => {
  const book = await Book.findByIdAndDelete(id);

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  return book;
};

/**
 * 📊 GET TOP BOOKS
 */
export const getTopBooks = async (query) => {
  const { limit = 10, sortBy = "sold" } = query;

  const limitNumber = parseInt(limit) || 10;

  const books = await Book.find({ status: "active" })
    .sort({ [sortBy]: -1 })
    .limit(limitNumber)
    .populate("categoryId", "name slug")
    .lean();

  return books;
};

/**
 * 🔍 SEARCH BOOKS BY TEXT
 */
export const searchBooks = async (keyword, limit = 20) => {
  const books = await Book.find(
    { $text: { $search: keyword }, status: "active" },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit))
    .populate("categoryId", "name slug")
    .lean();

  return books;
};

/**
 * 📚 GET RELATED BOOKS (cùng danh mục)
 */
export const getRelatedBooks = async (bookId, limit = 5) => {
  // ✅ 1. Get current book
  const book = await Book.findById(bookId).lean();
  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  // ✅ 2. Get related books (same category, excluding current book)
  const related = await Book.find({
    categoryId: book.categoryId,
    _id: { $ne: bookId },
    status: "active",
  })
    .limit(parseInt(limit))
    .populate("categoryId", "name slug")
    .lean();

  return related;
};

/**
 * 👤 GET BOOKS BY AUTHOR
 */
export const getBooksByAuthor = async (authorId, query) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1 } = query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const sortObj = {};
  sortObj[sortBy] = parseInt(sortOrder) || -1;

  const [data, total] = await Promise.all([
    Book.find({ authorId, status: "active" })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .populate("categoryId", "name slug")
      .lean(),

    Book.countDocuments({ authorId, status: "active" }),
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
 * 📦 GET AVAILABLE BOOKS (quantity > 0)
 */
export const getAvailableBooks = async (query) => {
  const { page = 1, limit = 10, categoryId } = query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    quantity: { $gt: 0 },
    status: "active",
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  const [data, total] = await Promise.all([
    Book.find(filter)
      .sort({ sold: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("categoryId", "name slug")
      .lean(),

    Book.countDocuments(filter),
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
 * 💰 UPDATE BOOK QUANTITY & SOLD
 */
export const updateBookInventory = async (bookId, quantityChange, soldChange = 0) => {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  const newQuantity = book.quantity + quantityChange;
  const newSold = book.sold + soldChange;

  if (newQuantity < 0) {
    const error = new Error("Insufficient quantity");
    error.status = 400;
    throw error;
  }

  const updated = await Book.findByIdAndUpdate(
    bookId,
    { quantity: newQuantity, sold: newSold },
    { new: true }
  ).lean();

  return updated;
};

/**
 * ⭐ UPDATE BOOK RATING
 */
export const updateBookRating = async (bookId, newRating, increment = true) => {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  if (newRating < 0 || newRating > 5) {
    const error = new Error("Rating must be between 0 and 5");
    error.status = 400;
    throw error;
  }

  const data = increment
    ? {
        rating: newRating,
        reviewCount: book.reviewCount + 1,
      }
    : {
        rating: newRating,
        reviewCount: Math.max(0, book.reviewCount - 1),
      };

  const updated = await Book.findByIdAndUpdate(bookId, data, {
    new: true,
  }).lean();

  return updated;
};

/**
 * 🏷️ UPDATE BOOK STATUS
 */
export const updateBookStatus = async (bookId, newStatus) => {
  const validStatuses = ["active", "inactive", "discontinued"];

  if (!validStatuses.includes(newStatus)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const updated = await Book.findByIdAndUpdate(
    bookId,
    { status: newStatus },
    { new: true }
  ).lean();

  if (!updated) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  return updated;
};

/**
 * 🔄 BULK UPDATE BOOKS
 */
export const bulkUpdateBooks = async (bookIds, updateData) => {
  const result = await Book.updateMany(
    { _id: { $in: bookIds } },
    { $set: updateData }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

/**
 * 📊 GET BOOKS STATISTICS
 */
export const getBookStatistics = async () => {
  const stats = await Book.aggregate([
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
        totalQuantity: [
          {
            $group: {
              _id: null,
              total: { $sum: "$quantity" },
            },
          },
        ],
        totalSold: [
          {
            $group: {
              _id: null,
              total: { $sum: "$sold" },
            },
          },
        ],
        avgRating: [
          {
            $group: {
              _id: null,
              average: { $avg: "$rating" },
            },
          },
        ],
        priceStats: [
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
              avgPrice: { $avg: "$price" },
            },
          },
        ],
        topCategories: [
          {
            $group: {
              _id: "$categoryId",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

/**
 * 💵 CALCULATE DISCOUNT PERCENTAGE
 */
export const getBookWithDiscountInfo = async (bookId) => {
  const book = await Book.findById(bookId)
    .populate("categoryId", "name slug")
    .lean();

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  // Calculate discount info
  if (book.discountPrice && book.discountPrice < book.price) {
    const discountPercentage = Math.round(
      ((book.price - book.discountPrice) / book.price) * 100
    );
    const savingAmount = book.price - book.discountPrice;

    return {
      ...book,
      discountPercentage,
      savingAmount,
    };
  }

  return {
    ...book,
    discountPercentage: 0,
    savingAmount: 0,
  };
};

/**
 * 🎯 GET FEATURED BOOKS
 */
export const getFeaturedBooks = async (limit = 10) => {
  const books = await Book.find({
    isFeatured: true,
    status: "active",
  })
    .sort({ sortOrder: 1, rating: -1 })
    .limit(parseInt(limit))
    .populate("categoryId", "name slug")
    .lean();

  return books;
};

/**
 * 🆕 GET NEW BOOKS
 */
export const getNewBooks = async (query) => {
  const { page = 1, limit = 10, days = 30 } = query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const daysNumber = parseInt(days) || 30;

  // Calculate date 'days' ago
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - daysNumber);

  const filter = {
    isNew: true,
    status: "active",
    createdAt: { $gte: dateFrom },
  };

  const [data, total] = await Promise.all([
    Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("categoryId", "name slug")
      .lean(),

    Book.countDocuments(filter),
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
 * 🏷️ GET DISCOUNT BOOKS
 */
export const getDiscountBooks = async (query) => {
  const { page = 1, limit = 10, minDiscount = 0 } = query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const minDiscountNumber = parseInt(minDiscount) || 0;

  const filter = {
    isDiscount: true,
    status: "active",
    discountPrice: { $ne: null },
  };

  let books = await Book.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .populate("categoryId", "name slug")
    .lean();

  // Filter by minimum discount percentage
  if (minDiscountNumber > 0) {
    books = books.filter((book) => {
      const discountPercentage = Math.round(
        ((book.price - book.discountPrice) / book.price) * 100
      );
      return discountPercentage >= minDiscountNumber;
    });
  }

  const total = await Book.countDocuments(filter);

  return {
    data: books,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};
