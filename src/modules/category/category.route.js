import express from "express";
import { createCategory, getCategories, getCategory, getCategoryBySlug, getChildrenCategories } from "./category.controller.js";

const router = express.Router();

// 🔥 Create category
router.post("/", createCategory);

// 📦 Get categories list
router.get("/", getCategories);

// � Get category by slug
router.get("/slug/:slug", getCategoryBySlug);

// 🌳 Get children categories
router.get("/:id/children", getChildrenCategories);

// 📋 Get category detail
router.get("/:id", getCategory);

export default router;