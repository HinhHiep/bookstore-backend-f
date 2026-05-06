import express from "express";
import { getRecommendations } from "./recommendation.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getRecommendations);

export default router;