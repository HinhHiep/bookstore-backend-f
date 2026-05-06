export const validateCreateReview = (data) => {
  const { bookId, rating, comment } = data;

  // 📚 bookId
  if (!bookId) {
    const error = new Error("bookId is required");
    error.status = 400;
    throw error;
  }

  // ⭐ rating
  if (rating === undefined) {
    const error = new Error("rating is required");
    error.status = 400;
    throw error;
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    const error = new Error("rating must be a number between 1 and 5");
    error.status = 400;
    throw error;
  }

  // 💬 comment
  if (comment !== undefined) {
    if (typeof comment !== "string") {
      const error = new Error("comment must be a string");
      error.status = 400;
      throw error;
    }

    if (comment.length > 1000) {
      const error = new Error("comment must be less than 1000 characters");
      error.status = 400;
      throw error;
    }
  }

  return {
    ...data,
    comment: comment?.trim() || "",
  };
};

export const validateUpdateReview = (data) => {
  const { rating, comment } = data;

  // không cho update rỗng
  if (rating === undefined && comment === undefined) {
    const error = new Error("Nothing to update");
    error.status = 400;
    throw error;
  }

  // ⭐ rating
  if (rating !== undefined) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      const error = new Error("rating must be between 1 and 5");
      error.status = 400;
      throw error;
    }
  }

  // 💬 comment
  if (comment !== undefined) {
    if (typeof comment !== "string") {
      const error = new Error("comment must be a string");
      error.status = 400;
      throw error;
    }

    if (comment.length > 1000) {
      const error = new Error("comment must be less than 1000 characters");
      error.status = 400;
      throw error;
    }
  }

  return {
    ...data,
    comment: comment?.trim(),
  };
};