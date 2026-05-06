import dotenv from "dotenv";
import Cart from "../modules/cart/cart.model.js";
import User from "../modules/user/user.model.js";
import Book from "../modules/book/book.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const buildCartItem = (book, quantity = 1) => ({
  bookId: book._id,
  quantity,
  title: book.title,
  thumbnail: book.coverImage || "",
  status: "active",
});

const seedCarts = async () => {
  try {
    await connectDB();

    await Cart.deleteMany();
    console.log("🗑️ Old carts removed");

    const users = await User.find({ status: "active" }).limit(4);
    if (users.length < 2) {
      throw new Error("Need at least 2 active users in the database to seed carts.");
    }

    const books = await Book.find({ status: "active" }).limit(6);
    if (books.length < 4) {
      throw new Error("Need at least 4 active books in the database to seed carts.");
    }

    const carts = [
      {
        userId: users[0]._id,
        items: [
          buildCartItem(books[0], 1),
          buildCartItem(books[1], 2),
        ],
      },
      {
        userId: users[1]._id,
        items: [
          buildCartItem(books[2], 1),
          buildCartItem(books[3], 1),
          buildCartItem(books[4], 3),
        ],
      },
      {
        userId: users[2] ? users[2]._id : users[0]._id,
        items: [
          buildCartItem(books[1], 1),
          buildCartItem(books[5], 2),
        ],
      },
    ];

    await Cart.insertMany(carts);
    console.log(`✅ Seeded ${carts.length} carts successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedCarts();
