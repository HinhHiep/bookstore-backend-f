import mongoose from "mongoose";
import Review from "./review.model.js";
import Book from "../book/book.model.js";
import {
  validateCreateReview,
  validateUpdateReview,
} from "./review.validator.js";

/**
 * 🔥 Recalculate rating (safe)
 */
const recalculateRating = async (bookId) => {
  const reviews = await Review.find({
    bookId,
    status: "active",
  });

  const ratingCount = reviews.length;

  const ratingAverage =
    ratingCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

  await Book.findByIdAndUpdate(bookId, {
    ratingAverage,
    ratingCount,
  });
};

/**
 * 🔥 CREATE REVIEW
 */
export const createReview = async (data, userId) => {
  const validated = validateCreateReview(data);

  const { bookId, rating, comment } = validated;

  // 📚 check book tồn tại
  const book = await Book.findById(bookId);
  if (!book || book.status !== "active") {
    const error = new Error("Book not found");
    error.status = 404;
    throw error;
  }

  // ❗ check duplicate review
  const existing = await Review.findOne({ bookId, userId });
  if (existing) {
    const error = new Error("User already reviewed this book");
    error.status = 409;
    throw error;
  }

  // 🔥 create review
  const review = await Review.create({
    bookId,
    userId,
    rating,
    comment,
    status: "active",
  });

  // 🔥 update rating
  await recalculateRating(bookId);

  return review;
};

/**
 * 📦 GET REVIEWS (LIST)
 */
export const getReviews = async (query) => {
  const {
    bookId,
    rating,
    status = "active",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (bookId) filter.bookId = bookId;
  if (rating) filter.rating = rating;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = Math.min(parseInt(limit) || 10, 50);
  const skip = (pageNumber - 1) * limitNumber;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("userId", "name email")
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
  };
};

/**
 * 🔍 GET REVIEW BY ID
 */
export const getReviewById = async (id, user) => {
  const review = await Review.findById(id);

  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }

  // ❗ hidden review
  if (
    review.status === "hidden" &&
    (!user || (user._id.toString() !== review.userId.toString() && !user.isAdmin))
  ) {
    const error = new Error("You are not allowed to view this review");
    error.status = 403;
    throw error;
  }

  return review;
};

/**
 * ✏️ UPDATE REVIEW
 */
export const updateReview = async (id, data, user) => {
  const validated = validateUpdateReview(data);

  const review = await Review.findById(id);

  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }

  // ❗ check quyền
  if (
    review.userId.toString() !== user._id.toString() &&
    !user.isAdmin
  ) {
    const error = new Error("You are not allowed to update this review");
    error.status = 403;
    throw error;
  }

  Object.assign(review, validated);
  await review.save();

  // 🔥 recalc rating
  await recalculateRating(review.bookId);

  return true;
};

/**
 * ❌ DELETE REVIEW (soft)
 */
export const deleteReview = async (id, user) => {
  const review = await Review.findById(id);

  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }

  // ❗ check quyền
  if (
    review.userId.toString() !== user._id.toString() &&
    !user.isAdmin
  ) {
    const error = new Error("You are not allowed to delete this review");
    error.status = 403;
    throw error;
  }

  review.status = "hidden";
  await review.save();

  // 🔥 recalc rating
  await recalculateRating(review.bookId);

  return true;
};
