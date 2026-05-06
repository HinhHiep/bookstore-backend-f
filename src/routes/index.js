import express from "express";
import categoryRoutes from "../modules/category/category.route.js";
import bookRoutes from "../modules/book/book.route.js";
import promotionRoutes from "../modules/promotion/promotion.route.js";
import reviewRoutes from "../modules/review/review.route.js";
import authRoutes from "../modules/auth/auth.route.js";
import userRoutes from "../modules/user/user.route.js";
import cartRoutes from "../modules/cart/cart.route.js";
import orderRoutes from "../modules/order/order.routes.js";
import recommendationRoutes from "../modules/recommendation/recommendation.routes.js";

const router = express.Router();

// 🔥 mount route
router.use("/categories", categoryRoutes);
router.use("/books", bookRoutes);
router.use("/promotions", promotionRoutes);
router.use("/reviews", reviewRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;