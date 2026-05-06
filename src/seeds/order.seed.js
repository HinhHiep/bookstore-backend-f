import dotenv from "dotenv";
import Order from "../modules/order/order.model.js";
import User from "../modules/user/user.model.js";
import Book from "../modules/book/book.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const formatOrderCode = (index) => {
  const prefix = "ORD";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${date}-${String(index).padStart(4, "0")}`;
};

const buildOrderItem = (book, quantity = 1) => {
  const price = book.price;
  const finalPrice = book.discountPrice && book.discountPrice < price ? book.discountPrice : price;
  return {
    bookId: book._id,
    title: book.title,
    thumbnail: book.coverImage || "",
    price,
    finalPrice,
    quantity,
    total: finalPrice * quantity,
  };
};

const seedOrders = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    console.log("🗑️ Old orders removed");

    const users = await User.find({ status: "active" }).limit(5);
    if (users.length < 2) {
      throw new Error("Need at least 2 active users in the database to seed orders.");
    }

    const books = await Book.find({ status: "active" }).limit(10);
    if (books.length < 3) {
      throw new Error("Need at least 3 active books in the database to seed orders.");
    }

    const orders = [
      {
        orderCode: formatOrderCode(1),
        userId: users[0]._id,
        customerInfo: {
          fullName: users[0].name,
          phone: "0901234567",
          email: users[0].email,
          address: {
            street: "123 Lê Lợi",
            ward: "Phường 1",
            district: "Quận 1",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [
          buildOrderItem(books[0], 1),
          buildOrderItem(books[1], 2),
        ],
        originalAmount: books[0].price * 1 + books[1].price * 2,
        discountAmount: (books[0].price - books[0].discountPrice || 0) * 1 + (books[1].price - books[1].discountPrice || 0) * 2,
        shippingFee: 30000,
        finalAmount: (books[0].discountPrice || books[0].price) * 1 + (books[1].discountPrice || books[1].price) * 2 + 30000,
        payment: {
          method: "cod",
          status: "pending",
        },
        status: "pending",
      },
      {
        orderCode: formatOrderCode(2),
        userId: users[1]._id,
        customerInfo: {
          fullName: users[1].name,
          phone: "0912345678",
          email: users[1].email,
          address: {
            street: "456 Nguyễn Huệ",
            ward: "Phường Bến Nghé",
            district: "Quận 1",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [
          buildOrderItem(books[2], 1),
          buildOrderItem(books[3], 1),
          buildOrderItem(books[4], 1),
        ],
        originalAmount: books[2].price + books[3].price + books[4].price,
        discountAmount:
          (books[2].price - books[2].discountPrice || 0) +
          (books[3].price - books[3].discountPrice || 0) +
          (books[4].price - books[4].discountPrice || 0),
        shippingFee: 25000,
        finalAmount:
          (books[2].discountPrice || books[2].price) +
          (books[3].discountPrice || books[3].price) +
          (books[4].discountPrice || books[4].price) +
          25000,
        payment: {
          method: "bank",
          status: "paid",
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}-02`,
        },
        status: "confirmed",
      },
      {
        orderCode: formatOrderCode(3),
        userId: users[2] ? users[2]._id : users[0]._id,
        customerInfo: {
          fullName: users[2] ? users[2].name : users[0].name,
          phone: "0923456789",
          email: users[2] ? users[2].email : users[0].email,
          address: {
            street: "789 Võ Văn Tần",
            ward: "Phường 6",
            district: "Quận 3",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [buildOrderItem(books[5], 2)],
        originalAmount: books[5].price * 2,
        discountAmount: (books[5].price - books[5].discountPrice || 0) * 2,
        shippingFee: 20000,
        finalAmount: (books[5].discountPrice || books[5].price) * 2 + 20000,
        payment: {
          method: "momo",
          status: "paid",
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}-03`,
        },
        status: "shipping",
      },
      {
        orderCode: formatOrderCode(4),
        userId: users[3] ? users[3]._id : users[0]._id,
        customerInfo: {
          fullName: users[3] ? users[3].name : users[0].name,
          phone: "0934567890",
          email: users[3] ? users[3].email : users[0].email,
          address: {
            street: "101A Trần Phú",
            ward: "Phường 9",
            district: "Quận 5",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [buildOrderItem(books[1], 1)],
        originalAmount: books[1].price,
        discountAmount: books[1].price - (books[1].discountPrice || books[1].price),
        shippingFee: 30000,
        finalAmount: (books[1].discountPrice || books[1].price) + 30000,
        payment: {
          method: "cod",
          status: "pending",
        },
        status: "pending",
      },
      {
        orderCode: formatOrderCode(5),
        userId: users[4] ? users[4]._id : users[0]._id,
        customerInfo: {
          fullName: users[4] ? users[4].name : users[0].name,
          phone: "0945678901",
          email: users[4] ? users[4].email : users[0].email,
          address: {
            street: "202B Cách Mạng Tháng 8",
            ward: "Phường Bến Thành",
            district: "Quận 1",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [buildOrderItem(books[2], 1), buildOrderItem(books[6], 1)],
        originalAmount: books[2].price + books[6].price,
        discountAmount:
          (books[2].price - (books[2].discountPrice || books[2].price)) +
          (books[6].price - (books[6].discountPrice || books[6].price)),
        shippingFee: 25000,
        finalAmount:
          (books[2].discountPrice || books[2].price) +
          (books[6].discountPrice || books[6].price) +
          25000,
        payment: {
          method: "bank",
          status: "paid",
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}-05`,
        },
        status: "completed",
      },
      {
        orderCode: formatOrderCode(6),
        userId: null,
        customerInfo: {
          fullName: "Khách vãng lai",
          phone: "0956789012",
          email: "guest@example.com",
          address: {
            street: "321 Phan Xích Long",
            ward: "Phường 5",
            district: "Quận Phú Nhuận",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [buildOrderItem(books[0], 1)],
        originalAmount: books[0].price,
        discountAmount: books[0].price - (books[0].discountPrice || books[0].price),
        shippingFee: 25000,
        finalAmount: (books[0].discountPrice || books[0].price) + 25000,
        payment: {
          method: "cod",
          status: "pending",
        },
        status: "pending",
      },
      {
        orderCode: formatOrderCode(7),
        userId: users[1]._id,
        customerInfo: {
          fullName: users[1].name,
          phone: "0912345678",
          email: users[1].email,
          address: {
            street: "456 Nguyễn Huệ",
            ward: "Phường Bến Nghé",
            district: "Quận 1",
            city: "Hồ Chí Minh",
            country: "Vietnam",
          },
        },
        items: [buildOrderItem(books[7], 1), buildOrderItem(books[8], 1)],
        originalAmount: books[7].price + books[8].price,
        discountAmount:
          (books[7].price - (books[7].discountPrice || books[7].price)) +
          (books[8].price - (books[8].discountPrice || books[8].price)),
        shippingFee: 20000,
        finalAmount:
          (books[7].discountPrice || books[7].price) +
          (books[8].discountPrice || books[8].price) +
          20000,
        payment: {
          method: "bank",
          status: "paid",
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}-07`,
        },
        cancelRequest: {
          reason: "Nhầm địa chỉ giao hàng",
          status: "approved",
          requestedAt: new Date(),
          processedAt: new Date(),
        },
        refund: {
          status: "completed",
          amount: 20000,
          reason: "Hoàn tiền do hủy đơn",
          createdAt: new Date(),
          processedAt: new Date(),
        },
        status: "cancelled",
      },
    ];

    await Order.insertMany(orders);
    console.log(`✅ Seeded ${orders.length} orders successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedOrders();
