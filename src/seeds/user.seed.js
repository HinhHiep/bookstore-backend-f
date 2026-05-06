import dotenv from "dotenv";
import User from "../modules/user/user.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    console.log("🗑️ Old users removed");

    const users = [
      {
        name: "Admin Bookstore",
        email: "admin@bookstore.com",
        password: "Admin@123",
        phone: "0123456789",
        role: "admin",
        status: "active",
      },
      {
        name: "Nguyễn Văn An",
        email: "an.nguyen@example.com",
        password: "User@1234",
        phone: "0987654321",
        role: "user",
        status: "active",
      },
      {
        name: "Trần Thị Bình",
        email: "binh.tran@example.com",
        password: "User@1234",
        phone: "0911223344",
        role: "user",
        status: "active",
      },
      {
        name: "Lê Hoàng Cường",
        email: "cuong.le@example.com",
        password: "User@1234",
        phone: "0933445566",
        role: "user",
        status: "active",
      },
      {
        name: "Phạm Thị Dung",
        email: "dung.pham@example.com",
        password: "User@1234",
        phone: "0977889900",
        role: "user",
        status: "inactive",
      },
      {
        name: "Vũ Minh Hoàng",
        email: "hoang.vu@example.com",
        password: "User@1234",
        phone: "0901122334",
        role: "user",
        status: "active",
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ Seeded ${createdUsers.length} users successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedUsers();
