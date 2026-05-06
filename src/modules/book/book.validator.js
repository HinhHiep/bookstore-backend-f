/**
 * 🔥 VALIDATE CREATE BOOK
 */
export const validateCreateBook = (data) => {
  const {
    title,
    author,
    categoryId,
    price,
    discountPrice,
    quantity,
  } = data;

  // 🔥 title
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    const error = new Error("Title is required");
    error.status = 400;
    throw error;
  }

  if (title.trim().length > 300) {
    const error = new Error("Title must be less than 300 characters");
    error.status = 400;
    throw error;
  }

  // 🔥 author
  if (!author || typeof author !== "string" || author.trim().length === 0) {
    const error = new Error("Author is required");
    error.status = 400;
    throw error;
  }

  if (author.trim().length > 200) {
    const error = new Error("Author must be less than 200 characters");
    error.status = 400;
    throw error;
  }

  // 🔥 categoryId
  if (!categoryId || typeof categoryId !== "string") {
    const error = new Error("Category ID is required");
    error.status = 400;
    throw error;
  }

  // 🔥 price
  if (price === undefined || price === null) {
    const error = new Error("Price is required");
    error.status = 400;
    throw error;
  }

  if (typeof price !== "number" || price < 0) {
    const error = new Error("Price must be a number >= 0");
    error.status = 400;
    throw error;
  }

  // 🔥 discountPrice
  if (discountPrice !== undefined && discountPrice !== null) {
    if (typeof discountPrice !== "number" || discountPrice < 0) {
      const error = new Error("Discount price must be a number >= 0");
      error.status = 400;
      throw error;
    }

    if (discountPrice >= price) {
      const error = new Error("Discount price must be less than original price");
      error.status = 400;
      throw error;
    }
  }

  // 🔥 quantity
  if (quantity !== undefined) {
    if (typeof quantity !== "number" || quantity < 0) {
      const error = new Error("Quantity must be a number >= 0");
      error.status = 400;
      throw error;
    }
  }

  // ✅ normalize data
  return {
    ...data,
    title: title.trim(),
    author: author.trim(),
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
