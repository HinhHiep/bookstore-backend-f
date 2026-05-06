import express from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "./review.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorize } from "../../common/middlewares/role.middleware.js";


const router = express.Router();

// 🔥 routes
router.post("/", protect, createReview);
router.get("/", getReviews);
router.get("/:id", getReviewById);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, authorize("admin"), deleteReview);

export default router;
