import * as reviewService from "./review.service.js";

/**
 * 🔥 CREATE REVIEW
 * POST /api/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const userId = req.user?._id; // lấy từ auth middleware

    const review = await reviewService.createReview(req.body, userId);

    return res.status(201).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📦 GET REVIEWS (LIST)
 * GET /api/reviews
 */
export const getReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getReviews(req.query);

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔍 GET REVIEW DETAIL
 * GET /api/reviews/:id
 */
export const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✏️ UPDATE REVIEW
 * PUT /api/reviews/:id
 */
export const updateReview = async (req, res, next) => {
  try {
    await reviewService.updateReview(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      status: "success",
      data: {
        message: "Review updated successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ❌ DELETE REVIEW (soft)
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user);

    return res.status(200).json({
      status: "success",
      data: {
        message: "Review deleted successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};