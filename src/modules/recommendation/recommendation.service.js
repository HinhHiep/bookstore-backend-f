import Order from "../order/order.model.js";
import Review from "../review/review.model.js";
import Book from "../book/book.model.js";

/**
 * 🔥 GET USER PREFERENCES
 */
const getUserPreferences = async (userId) => {
  const categoryScore = {};

  // 📦 từ order
  const orders = await Order.find({
    userId,
    status: { $in: ["completed", "confirmed"] },
  }).populate("items.bookId");

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.bookId?.category?.toString();
      if (!cat) return;

      categoryScore[cat] = (categoryScore[cat] || 0) + 5;
    });
  });

  // ⭐ từ review
  const reviews = await Review.find({
    userId,
    rating: { $gte: 4 },
  }).populate("bookId");

  reviews.forEach((review) => {
    const cat = review.bookId?.category?.toString();
    if (!cat) return;

    categoryScore[cat] = (categoryScore[cat] || 0) + 3;
  });

  return categoryScore;
};


export const getRecommendations = async (userId) => {
  const preferences = await getUserPreferences(userId);

  const topCategories = Object.entries(preferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  if (topCategories.length === 0) {
    // 👉 fallback: sách phổ biến
    return Book.find()
      .sort({ sold: -1 })
      .limit(10);
  }

  // 🔥 lấy sách theo category
  const books = await Book.find({
    category: { $in: topCategories },
    status: "active",
  })
    .sort({ sold: -1 })
    .limit(20);

  return books;
};