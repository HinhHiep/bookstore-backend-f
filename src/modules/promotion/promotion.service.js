import Promotion from "./promotion.model.js";
import { validateCreatePromotion, validateUpdatePromotion } from "./promotion.validator.js";

/**
 * 🔥 CREATE PROMOTION
 */
export const createPromotion = async (data) => {
  // ✅ 1. Validate + normalize
  const validated = validateCreatePromotion(data);

  const {
    name,
    description,
    value,
    maxDiscount,
    minOrderValue,
    event,
    bookIds,
    usageLimit,
    startDate,
    endDate,
    status,
  } = validated;

  // ✅ 2. Create promotion
  const promotion = await Promotion.create({
    name,
    description: description || "",
    value,
    maxDiscount: maxDiscount || null,
    minOrderValue: minOrderValue || 0,
    event: event || null,
    bookIds: bookIds || [],
    usageLimit: usageLimit || null,
    usedCount: 0,
    startDate,
    endDate,
    status: status || "active",
  });

  return promotion;
};

/**
 * 📦 GET PROMOTIONS LIST
 */
export const getPromotions = async (query) => {
  const {
    status,
    event,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = -1,
  } = query;

  // 🔥 build filter
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (event) {
    filter.event = event;
  }

  // isActive: promotion đang chạy (now between startDate and endDate)
  if (isActive === "true") {
    const now = new Date();
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
    filter.status = "active";
  }

  // 🔥 pagination
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // 🔥 sorting
  const sortObj = {};
  sortObj[sortBy] = parseInt(sortOrder) || -1;

  // 🔥 query song song
  const [data, total] = await Promise.all([
    Promotion.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .populate("bookIds", "title slug price")
      .lean(),

    Promotion.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

/**
 * 📋 GET PROMOTION BY ID
 */
export const getPromotionById = async (id) => {
  const promotion = await Promotion.findById(id)
    .populate("bookIds", "title slug price categoryId")
    .lean();

  if (!promotion) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  return promotion;
};

/**
 * 🔄 UPDATE PROMOTION
 */
export const updatePromotion = async (id, data) => {
  // ✅ 1. Check promotion exists
  const promotion = await Promotion.findById(id);
  if (!promotion) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  // ✅ 2. Validate update data
  const validated = validateUpdatePromotion(data);

  // ✅ 3. Update promotion
  const updated = await Promotion.findByIdAndUpdate(
    id,
    { $set: validated },
    { new: true, runValidators: true }
  )
    .populate("bookIds", "title slug price")
    .lean();

  return updated;
};

/**
 * 🗑️ DELETE PROMOTION
 */
export const deletePromotion = async (id) => {
  const promotion = await Promotion.findByIdAndDelete(id);

  if (!promotion) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  return promotion;
};

/**
 * 🎯 GET ACTIVE PROMOTIONS (đang chạy)
 */
export const getActivePromotions = async () => {
  const now = new Date();

  const promotions = await Promotion.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .populate("bookIds", "title slug price")
    .lean();

  return promotions;
};

/**
 * 📚 GET PROMOTIONS FOR SPECIFIC BOOK
 */
export const getPromotionsForBook = async (bookId) => {
  const now = new Date();

  const promotions = await Promotion.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { isGlobal: true },
      { bookIds: bookId },
    ],
  })
    .sort({ value: -1, sortOrder: 1 })
    .lean();

  return promotions;
};

/**
 * 💰 CALCULATE DISCOUNT FOR BOOK
 */
export const calculateDiscount = async (bookId, bookPrice, orderValue = 0) => {
  // ✅ 1. Get all applicable promotions
  const promotions = await getPromotionsForBook(bookId);

  if (promotions.length === 0) {
    return {
      originalPrice: bookPrice,
      discountAmount: 0,
      finalPrice: bookPrice,
      discountPercentage: 0,
      appliedPromotion: null,
    };
  }

  // ✅ 2. Filter promotions by minOrderValue and usageLimit
  const validPromotions = promotions.filter((p) => {
    // Check minOrderValue
    if (p.minOrderValue && orderValue < p.minOrderValue) {
      return false;
    }

    // Check usageLimit
    if (p.usageLimit && p.usedCount >= p.usageLimit) {
      return false;
    }

    return true;
  });

  if (validPromotions.length === 0) {
    return {
      originalPrice: bookPrice,
      discountAmount: 0,
      finalPrice: bookPrice,
      discountPercentage: 0,
      appliedPromotion: null,
    };
  }

  // ✅ 3. Calculate discount for each promotion and pick the best one
  let bestPromotion = null;
  let maxDiscount = 0;

  for (const promo of validPromotions) {
    let discount = (bookPrice * promo.value) / 100;

    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }

    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestPromotion = promo;
    }
  }

  const finalPrice = Math.max(bookPrice - maxDiscount, 0);

  return {
    originalPrice: bookPrice,
    discountAmount: maxDiscount,
    finalPrice,
    discountPercentage: bestPromotion.value,
    appliedPromotion: {
      _id: bestPromotion._id,
      name: bestPromotion.name,
      value: bestPromotion.value,
    },
  };
};

/**
 * 📊 INCREMENT USED COUNT
 */
export const incrementUsedCount = async (promotionId) => {
  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  // Check if exceeded usage limit
  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
    const error = new Error("Promotion usage limit exceeded");
    error.status = 400;
    throw error;
  }

  const updated = await Promotion.findByIdAndUpdate(
    promotionId,
    { $inc: { usedCount: 1 } },
    { new: true }
  ).lean();

  return updated;
};

/**
 * 🔄 UPDATE PROMOTION STATUS
 */
export const updatePromotionStatus = async (promotionId, newStatus) => {
  const validStatuses = ["active", "inactive"];

  if (!validStatuses.includes(newStatus)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const updated = await Promotion.findByIdAndUpdate(
    promotionId,
    { status: newStatus },
    { new: true }
  ).lean();

  if (!updated) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  return updated;
};

/**
 * 🏷️ GET PROMOTIONS BY EVENT
 */
export const getPromotionsByEvent = async (event, query) => {
  const { page = 1, limit = 10, includeExpired = false } = query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const filter = { event };

  if (!includeExpired) {
    const now = new Date();
    filter.endDate = { $gte: now };
  }

  const [data, total] = await Promise.all([
    Promotion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("bookIds", "title slug price")
      .lean(),

    Promotion.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

/**
 * 📊 GET PROMOTION STATISTICS
 */
export const getPromotionStatistics = async () => {
  const now = new Date();

  const stats = await Promotion.aggregate([
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        activeCount: [
          {
            $match: {
              status: "active",
              startDate: { $lte: now },
              endDate: { $gte: now },
            },
          },
          { $count: "count" },
        ],
        inactiveCount: [
          { $match: { status: "inactive" } },
          { $count: "count" },
        ],
        upcomingCount: [
          { $match: { startDate: { $gt: now } } },
          { $count: "count" },
        ],
        expiredCount: [
          { $match: { endDate: { $lt: now } } },
          { $count: "count" },
        ],
        avgValue: [
          {
            $group: {
              _id: null,
              average: { $avg: "$value" },
            },
          },
        ],
        totalUsed: [
          {
            $group: {
              _id: null,
              total: { $sum: "$usedCount" },
            },
          },
        ],
        topPromotions: [
          { $sort: { usedCount: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 1,
              name: 1,
              value: 1,
              usedCount: 1,
              event: 1,
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

/**
 * 🔍 RESET USED COUNT (admin function)
 */
export const resetUsedCount = async (promotionId) => {
  const updated = await Promotion.findByIdAndUpdate(
    promotionId,
    { usedCount: 0 },
    { new: true }
  ).lean();

  if (!updated) {
    const error = new Error("Promotion not found");
    error.status = 404;
    throw error;
  }

  return updated;
};

/**
 * 🎯 BULK UPDATE PROMOTION STATUS
 */
export const bulkUpdatePromotionStatus = async (promotionIds, newStatus) => {
  const validStatuses = ["active", "inactive"];

  if (!validStatuses.includes(newStatus)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const result = await Promotion.updateMany(
    { _id: { $in: promotionIds } },
    { $set: { status: newStatus } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};
