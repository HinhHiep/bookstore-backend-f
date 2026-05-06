/**
 * 🔥 VALIDATE CREATE PROMOTION
 */
export const validateCreatePromotion = (data) => {
  const {
    name,
    value,
    startDate,
    endDate,
    maxDiscount,
    minOrderValue,
  } = data;

  // 🔥 name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const error = new Error("Promotion name is required");
    error.status = 400;
    throw error;
  }

  if (name.trim().length > 200) {
    const error = new Error("Promotion name must be less than 200 characters");
    error.status = 400;
    throw error;
  }

  // 🔥 value
  if (value === undefined || value === null) {
    const error = new Error("Promotion value is required");
    error.status = 400;
    throw error;
  }

  if (typeof value !== "number" || value < 0 || value > 100) {
    const error = new Error("Promotion value must be a number between 0 and 100");
    error.status = 400;
    throw error;
  }

  // 🔥 startDate
  if (!startDate) {
    const error = new Error("Start date is required");
    error.status = 400;
    throw error;
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    const error = new Error("Invalid start date format");
    error.status = 400;
    throw error;
  }

  // 🔥 endDate
  if (!endDate) {
    const error = new Error("End date is required");
    error.status = 400;
    throw error;
  }

  const end = new Date(endDate);
  if (isNaN(end.getTime())) {
    const error = new Error("Invalid end date format");
    error.status = 400;
    throw error;
  }

  // 🔥 Kiểm tra startDate < endDate
  if (start >= end) {
    const error = new Error("Start date must be before end date");
    error.status = 400;
    throw error;
  }

  // 🔥 maxDiscount
  if (maxDiscount !== undefined && maxDiscount !== null) {
    if (typeof maxDiscount !== "number" || maxDiscount < 0) {
      const error = new Error("Max discount must be a number >= 0");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 minOrderValue
  if (minOrderValue !== undefined && minOrderValue !== null) {
    if (typeof minOrderValue !== "number" || minOrderValue < 0) {
      const error = new Error("Min order value must be a number >= 0");
      error.status = 400;
      throw error;
    }
  }

  // ✅ normalize data
  return {
    ...data,
    name: name.trim(),
    startDate: start,
    endDate: end,
  };
};

/**
 * 🔥 VALIDATE UPDATE PROMOTION
 */
export const validateUpdatePromotion = (data) => {
  const {
    name,
    value,
    startDate,
    endDate,
    maxDiscount,
    minOrderValue,
  } = data;

  // 🔥 name (optional)
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      const error = new Error("Promotion name is required");
      error.status = 400;
      throw error;
    }

    if (name.trim().length > 200) {
      const error = new Error("Promotion name must be less than 200 characters");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 value (optional)
  if (value !== undefined) {
    if (typeof value !== "number" || value < 0 || value > 100) {
      const error = new Error("Promotion value must be a number between 0 and 100");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 Dates validation
  let start = null;
  let end = null;

  if (startDate !== undefined) {
    start = new Date(startDate);
    if (isNaN(start.getTime())) {
      const error = new Error("Invalid start date format");
      error.status = 400;
      throw error;
    }
  }

  if (endDate !== undefined) {
    end = new Date(endDate);
    if (isNaN(end.getTime())) {
      const error = new Error("Invalid end date format");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 Check startDate < endDate
  if (start && end && start >= end) {
    const error = new Error("Start date must be before end date");
    error.status = 400;
    throw error;
  }

  // ✅ normalize data
  const normalized = { ...data };
  if (name !== undefined) normalized.name = name.trim();
  if (start !== null) normalized.startDate = start;
  if (end !== null) normalized.endDate = end;

  return normalized;
};

/**
 * 🔥 VALIDATE OBJECT ID
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== "string") {
    const error = new Error("ID is required");
    error.status = 400;
    throw error;
  }

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400;
    throw error;
  }

  return id;
};
