import dotenv from "dotenv";
import Review from "../modules/review/review.model.js";
import Book from "../modules/book/book.model.js";
import User from "../modules/user/user.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedReviews = async () => {
  try {
    await connectDB();

    await Review.deleteMany();
    console.log("🗑️ Old reviews removed");

    const userList = await User.find({ status: "active" }).limit(8);
    if (!userList.length) {
      throw new Error("No active users found to seed reviews. Please create real users in the database first.");
    }

    const books = await Book.find({ status: "active" }).limit(8);
    if (!books.length) {
      throw new Error("No active books found to seed reviews. Please seed books first.");
    }

    const reviewComments = [
      "Nội dung sách rất hay, mình học được nhiều điều bổ ích.",
      "Sách đọc cuốn hút, ngôn từ dễ hiểu và truyền cảm hứng.",
      "Chất lượng tốt, giao hàng nhanh, mình rất hài lòng.",
      "Câu chuyện hấp dẫn nhưng một vài phần hơi dài dòng.",
      "Tác giả trình bày rõ ràng, phù hợp với người mới bắt đầu.",
      "Đây là một trong những cuốn sách yêu thích nhất của tôi.",
      "Giá trị nội dung xứng đáng với số tiền bỏ ra.",
      "Mặc dù ý tưởng tốt nhưng kết thúc chưa thực sự thỏa mãn.",
      "Sách lý tưởng để tặng bạn bè và người thân.",
      "Phong cách viết dễ đọc và rất thực tế.",
    ];

    const reviews = [];

    for (let i = 0; i < books.length; i += 1) {
      const book = books[i];
      const ratingCount = i % 3 === 0 ? 3 : 2;

      for (let j = 0; j < ratingCount; j += 1) {
        const user = userList[(i + j) % userList.length];
        reviews.push({
          bookId: book._id,
          userId: user._id,
          rating: 3 + ((i + j) % 3),
          comment: reviewComments[(i * 2 + j) % reviewComments.length],
          status: "active",
        });
      }
    }

    await Review.insertMany(reviews);
    console.log(`✅ Seeded ${reviews.length} reviews successfully`);

    const summary = await Review.aggregate([
      {
        $group: {
          _id: "$bookId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const updatePromises = summary.map((item) =>
      Book.updateOne(
        { _id: item._id },
        {
          rating: Number(item.averageRating.toFixed(1)),
          reviewCount: item.count,
        }
      )
    );

    await Promise.all(updatePromises);
    console.log("🔧 Updated book rating and reviewCount from seeded reviews");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedReviews();
