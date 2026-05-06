import dotenv from "dotenv";
import Promotion from "../modules/promotion/promotion.model.js";
import Book from "../modules/book/book.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedPromotions = async () => {
  try {
    await connectDB();

    // Clean existing promotions
    await Promotion.deleteMany();
    console.log("🗑️ Old promotions removed");

    // Get some book IDs for specific promotions (we'll use dummy IDs for now)
    // In a real scenario, you'd query actual book IDs from the database
    const sampleBookIds = [
      "507f1f77bcf86cd799439011", // Dummy ObjectId 1
      "507f1f77bcf86cd799439012", // Dummy ObjectId 2
      "507f1f77bcf86cd799439013", // Dummy ObjectId 3
    ];
   // Flash Sale Cuối Tuần: Lấy 6 sách bán chạy nhất để áp dụng flash sale
    const topBooks = await Book.find({ status: "active" })
      .sort({ sold: -1 })
      .limit(6)
      .select("_id");
    const topBookIds = topBooks.map((book) => book._id.toString());

    // Khuyến Mãi Sách Văn Học: Lấy tất cả sách thuộc category văn học (giả sử categoryId = "69f999791768ce6fdb821b55")
    const literatureBooks = await Book.find({
      status: "active",
      categoryId: "69f9997a1768ce6fdb821b58",
    }).select("_id");
    const literatureBookIds = literatureBooks.map((book) => book._id.toString());

   // Back to School: Lấy 6 sách giáo khoa và tham khảo cụ thể có parentId 69f999791768ce6fdb821b52
    const backToSchoolBooks = await Book.find({
      status: "active",
      parentId: "69f999791768ce6fdb821b52",
    }).limit(6).select("_id");
    const backToSchoolBookIds = backToSchoolBooks.map((book) => book._id.toString());
    const promotions = [
      {
        name: "Flash Sale Cuối Tuần",
        description: "Giảm giá 30% cho tất cả sách trong cuối tuần này. Nhanh tay đặt hàng!",
        value: 30,
        maxDiscount: 100000, // Giảm tối đa 100k
        minOrderValue: 200000, // Đơn hàng tối thiểu 200k
        startDate: new Date("2024-01-01T00:00:00.000Z"),
        endDate: new Date("2024-01-07T23:59:59.000Z"),
        event: "flash_sale",
        bookIds: topBookIds, // Áp dụng cho 6 sách bán chạy nhất
        usageLimit: null, // Không giới hạn
        usedCount: 0,
        status: "active",
        isGlobal: true,
        sortOrder: 1,
      },
      {
        name: "Khuyến Mãi Sách Văn Học Việt Nam",
        description: "Giảm 25% cho tất cả sách văn học Việt Nam và thế giới. Khám phá tri thức!",
        value: 25,
        maxDiscount: 80000,
        minOrderValue: 150000,
        startDate: new Date("2024-01-15T00:00:00.000Z"),
        endDate: new Date("2024-02-15T23:59:59.000Z"),
        event: "literature_month",
        bookIds: literatureBookIds, // Áp dụng cho category văn học
        usageLimit: 500,
        usedCount: 0,
        status: "active",
        isGlobal: false,
        sortOrder: 2,
      },
      {
        name: "Back to School 2024",
        description: "Giảm 20% sách giáo khoa và sách tham khảo cho học sinh, sinh viên.",
        value: 20,
        maxDiscount: 50000,
        minOrderValue: 100000,
        startDate: new Date("2024-08-01T00:00:00.000Z"),
        endDate: new Date("2024-09-30T23:59:59.000Z"),
        event: "back_to_school",
        bookIds: backToSchoolBookIds, // Áp dụng cho sách giáo khoa và tham khảo cụ thể
        usageLimit: 1000,
        usedCount: 0,
        status: "active",
        isGlobal: false,
        sortOrder: 3,
      }
    ];

    await Promotion.insertMany(promotions);
    console.log(`✅ Seeded ${promotions.length} promotions successfully`);

    // Log summary
    const activePromotions = promotions.filter(p => p.status === 'active').length;
    const globalPromotions = promotions.filter(p => p.isGlobal).length;
    const limitedPromotions = promotions.filter(p => p.usageLimit !== null).length;

  

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedPromotions();
