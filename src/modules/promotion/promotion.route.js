import express from "express";
import {
  createPromotion,
  getPromotions,
  getPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getPromotionsForBook,
  calculateDiscount,
  incrementUsedCount,
  updatePromotionStatus,
  getPromotionsByEvent,
  getPromotionStatistics,
  resetUsedCount,
  bulkUpdatePromotionStatus,
} from "./promotion.controller.js";

const router = express.Router();

// 🔥 Create promotion
router.post("/", createPromotion);

// 📊 Special routes (must be before /:id)
router.get("/active", getActivePromotions);
router.get("/stats", getPromotionStatistics);
router.post("/calculate", calculateDiscount);
router.patch("/bulk/status", bulkUpdatePromotionStatus);
router.get("/event/:event", getPromotionsByEvent);

// 📦 Get promotions list
router.get("/", getPromotions);

// 📚 Get promotions for specific book
router.get("/book/:bookId", getPromotionsForBook);

// 📋 Get promotion detail
router.get("/:id", getPromotion);

// 🔄 Update promotion
router.patch("/:id", updatePromotion);

// 🗑️ Delete promotion
router.delete("/:id", deletePromotion);

// 📊 Promotion usage operations
router.patch("/:id/use", incrementUsedCount);
router.patch("/:id/status", updatePromotionStatus);
router.patch("/:id/reset", resetUsedCount);

export default router;
