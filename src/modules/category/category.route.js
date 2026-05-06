import express from "express";
import { createCategory, getCategories, getCategory, getChildrenCategories } from "./category.controller.js";

const router = express.Router();

// 🔥 Create category
router.post("/", createCategory);

// 📦 Get categories list
router.get("/", getCategories);

// 📋 Get category detail
router.get("/:id", getCategory);

// 🌳 Get children categories
router.get("/:id/children", getChildrenCategories);

export default router;