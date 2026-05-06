import express from "express";
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getTopBooks,
  searchBooks,
  getRelatedBooks,
  getAvailableBooks,
  getFeaturedBooks,
  getNewBooks,
  getDiscountBooks,
  getBookWithDiscountInfo,
  getBookStatistics,
} from "./book.controller.js";

const router = express.Router();

// 🔥 Create book
router.post("/", createBook);

// 📊 Specific routes (must be before /:id to match first)
router.get("/top", getTopBooks);
router.get("/search", searchBooks);
router.get("/featured", getFeaturedBooks);
router.get("/new", getNewBooks);
router.get("/discount", getDiscountBooks);
router.get("/stats", getBookStatistics);
router.get("/available", getAvailableBooks);

// 📦 Get books list
router.get("/", getBooks);

// 📋 Get book detail with special routes
router.get("/:id/related", getRelatedBooks);
router.get("/:id/discount-info", getBookWithDiscountInfo);
router.get("/:id", getBook);

// 🔄 Update book
router.patch("/:id", updateBook);

// 🗑️ Delete book
router.delete("/:id", deleteBook);

export default router;
