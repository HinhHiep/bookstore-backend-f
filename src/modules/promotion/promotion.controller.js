import * as promotionService from "./promotion.service.js";
import { validateObjectId } from "./promotion.validator.js";

/**
 * 🔥 CREATE PROMOTION
 * POST /api/promotions
 * 
 * @description Tạo chương trình khuyến mãi/giảm giá mới (% discount, minOrderValue, time range).
 * @use-case Quản trị viên tạo flash sale, mã giảm giá, khuyến mãi theo dịp lễ.
 * 
 * @request {
 *   "name": "Flash Sale July 2024",
 *   "value": 20 (% discount, 0-100),
 *   "maxDiscount": 500000 (tối đa giảm bao nhiêu),
 *   "minOrderValue": 1000000 (tối thiểu đơn hàng),
 *   "startDate": "2024-07-01T00:00:00Z",
 *   "endDate": "2024-07-31T23:59:59Z",
 *   "bookIds": ["507f1f77bcf86cd799439011"] (optional: book cụ thể, hoặc global),
 *   "usageLimit": 1000,
 *   "isGlobal": false
 * }
 * 
 * @response 201: { status: "success", data: { _id, name, value, startDate, ... } }
 * @errors 400: Name required | Invalid % | 404: Book not found | 409: Duplicate name
 */
export const createPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);

    return res.status(201).json({
      status: "success",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📦 GET PROMOTIONS LIST
 * GET /api/promotions
 */
export const getPromotions = async (req, res, next) => {
  try {
    const result = await promotionService.getPromotions(req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📋 GET PROMOTION BY ID
 * GET /api/promotions/:id
 */
export const getPromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const promotion = await promotionService.getPromotionById(id);

    return res.status(200).json({
      status: "success",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔄 UPDATE PROMOTION
 * PATCH /api/promotions/:id
 */
export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const promotion = await promotionService.updatePromotion(id, req.body);

    return res.status(200).json({
      status: "success",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🗑️ DELETE PROMOTION
 * DELETE /api/promotions/:id
 */
export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    await promotionService.deletePromotion(id);

    return res.status(200).json({
      status: "success",
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 GET ACTIVE PROMOTIONS
 * GET /api/promotions/active
 */
export const getActivePromotions = async (req, res, next) => {
  try {
    const promotions = await promotionService.getActivePromotions();

    return res.status(200).json({
      status: "success",
      data: promotions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📚 GET PROMOTIONS FOR BOOK
 * GET /api/promotions/book/:bookId
 */
export const getPromotionsForBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    validateObjectId(bookId);

    const promotions = await promotionService.getPromotionsForBook(bookId);

    return res.status(200).json({
      status: "success",
      data: promotions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 💰 CALCULATE DISCOUNT
 * POST /api/promotions/calculate
 * Body: { bookId, bookPrice, orderValue? }
 */
export const calculateDiscount = async (req, res, next) => {
  try {
    const { bookId, bookPrice, orderValue } = req.body;

    if (!bookId || typeof bookId !== "string") {
      const error = new Error("Book ID is required");
      error.status = 400;
      throw error;
    }

    if (bookPrice === undefined || bookPrice === null) {
      const error = new Error("Book price is required");
      error.status = 400;
      throw error;
    }

    validateObjectId(bookId);

    const result = await promotionService.calculateDiscount(
      bookId,
      bookPrice,
      orderValue || 0
    );

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📊 INCREMENT USED COUNT
 * PATCH /api/promotions/:id/use
 */
export const incrementUsedCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const promotion = await promotionService.incrementUsedCount(id);

    return res.status(200).json({
      status: "success",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔄 UPDATE PROMOTION STATUS
 * PATCH /api/promotions/:id/status
 * Body: { status: "active" | "inactive" }
 */
export const updatePromotionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    validateObjectId(id);

    if (!status) {
      const error = new Error("Status is required");
      error.status = 400;
      throw error;
    }

    const promotion = await promotionService.updatePromotionStatus(id, status);

    return res.status(200).json({
      status: "success",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🏷️ GET PROMOTIONS BY EVENT
 * GET /api/promotions/event/:event
 */
export const getPromotionsByEvent = async (req, res, next) => {
  try {
    const { event } = req.params;

    const result = await promotionService.getPromotionsByEvent(event, req.query);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📊 GET PROMOTION STATISTICS
 * GET /api/promotions/stats
 */
export const getPromotionStatistics = async (req, res, next) => {
  try {
    const stats = await promotionService.getPromotionStatistics();

    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔍 RESET USED COUNT
 * PATCH /api/promotions/:id/reset
 */
export const resetUsedCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const promotion = await promotionService.resetUsedCount(id);

    return res.status(200).json({
      status: "success",
      data: promotion,
      message: "Used count reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 BULK UPDATE PROMOTION STATUS
 * PATCH /api/promotions/bulk/status
 * Body: { promotionIds: [...], status: "active" | "inactive" }
 */
export const bulkUpdatePromotionStatus = async (req, res, next) => {
  try {
    const { promotionIds, status } = req.body;

    if (!Array.isArray(promotionIds) || promotionIds.length === 0) {
      const error = new Error("Promotion IDs array is required");
      error.status = 400;
      throw error;
    }

    if (!status) {
      const error = new Error("Status is required");
      error.status = 400;
      throw error;
    }

    const result = await promotionService.bulkUpdatePromotionStatus(
      promotionIds,
      status
    );

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
