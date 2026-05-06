import express from "express";
import {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  clearCart,
    mergeCart,
} from "./cart.controller.js";

import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 tất cả cart đều cần login
router.use(protect);

// 🛒 cart
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:bookId", updateItem);
router.delete("/:bookId", removeItem);
router.delete("/", clearCart);
router.post("/merge", protect, mergeCart);

export default router;