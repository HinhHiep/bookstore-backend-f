import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateStatus,
  cancelOrder,
  refundOrder,
    checkout,
    guestCheckout,
} from "./order.controller.js";

import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorize } from "../../common/middlewares/role.middleware.js";

const router = express.Router();

// 🔥 create (guest + user)
router.post("/", createOrder);
router.post("/guest-checkout", guestCheckout);
// 🔐 user
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/cancel", protect, cancelOrder);
router.post("/checkout", protect, checkout);


// 🔐 admin
router.patch("/:id/status", protect, authorize("admin"), updateStatus);
router.post("/:id/refund", protect, authorize("admin"), refundOrder);

export default router;































