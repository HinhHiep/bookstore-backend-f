export const validateCreateCategory = (data) => {
  const {
    name,
    parentId,
    sortOrder,
    isFeatured,
    keywords,
    tags,
  } = data;

  // 🔥 name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const error = new Error("Name is required");
    error.status = 400;
    throw error;
  }

  if (name.trim().length > 200) {
    const error = new Error("Name must be less than 200 characters");
    error.status = 400;
    throw error;
  }

  // 🔥 sortOrder
  if (sortOrder !== undefined) {
    if (typeof sortOrder !== "number" || sortOrder < 0) {
      const error = new Error("sortOrder must be a number >= 0");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 isFeatured
  if (isFeatured !== undefined && typeof isFeatured !== "boolean") {
    const error = new Error("isFeatured must be boolean");
    error.status = 400;
    throw error;
  }

  // 🔥 keywords
  if (keywords !== undefined) {
    if (!Array.isArray(keywords)) {
      const error = new Error("keywords must be an array of strings");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 tags
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      const error = new Error("tags must be an array of strings");
      error.status = 400;
      throw error;
    }
  }

  // ✅ normalize data
  return {
    ...data,
    name: name.trim(),
  };
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

  // Check if it's a valid MongoDB ObjectId format (24 hex characters)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400;
    throw error;
  }

  return id;
};