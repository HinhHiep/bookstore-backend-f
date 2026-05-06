import express from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./user.controller.js";

import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// 👤 profile
router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);

// 📦 address
router.post("/addresses", protect, addAddress);
router.patch("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.patch("/addresses/:id/default", protect, setDefaultAddress);

export default router;