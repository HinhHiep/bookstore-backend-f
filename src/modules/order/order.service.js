import Order from "./order.model.js";
import Book from "../book/book.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../../common/utils/email.js";

/**
 * 🔥 Generate order code
 */
const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `OD${date}-${random}`;
};

const sendOrderConfirmationEmail = async (order) => {
  const to = order?.customerInfo?.email;
  if (!to) return;

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackUrl = `${frontendUrl}/track-order`;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.title}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.finalPrice?.toLocaleString("vi-VN")}đ</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <h2 style="color:#ea580c;">Dat hang thanh cong</h2>
      <p>Cam on ban da dat hang tai BookStore.</p>
      <p><strong>Ma tra cuu don hang:</strong> ${order.orderCode}</p>
      <p><strong>Tong thanh toan:</strong> ${order.finalAmount?.toLocaleString("vi-VN")}đ</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #eee;">San pham</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #eee;">SL</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #eee;">Don gia</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top:16px;">
        Ban co the tra cuu don hang tai:
        <a href="${trackUrl}" target="_blank" rel="noreferrer">${trackUrl}</a>
      </p>
      <p style="color:#666;">Vui long luu lai ma don de theo doi trang thai giao hang.</p>
    </div>
  `;

  await sendEmail(to, `[BookStore] Xac nhan don hang ${order.orderCode}`, html);
};

/**
 * 💰 Calculate pricing
 */
const calculatePricing = (items) => {
  let originalAmount = 0;
  let discountAmount = 0;

  items.forEach((item) => {
    originalAmount += item.price * item.quantity;
    discountAmount += (item.price - item.finalPrice) * item.quantity;
  });

  const shippingFee = originalAmount >= 300000 ? 0 : 30000;

  const finalAmount = originalAmount - discountAmount + shippingFee;

  if (finalAmount < 0) {
    throw new Error("Invalid final amount");
  }

  return { originalAmount, discountAmount, shippingFee, finalAmount };
};

/**
 * 🔥 CREATE ORDER (CORE)
 */
export const createOrder = async (data, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerInfo, paymentMethod } = data;

    // ❌ validate items
    if (!items || items.length === 0) {
      throw new Error("Order must have items");
    }

    // ❌ guest phải có customerInfo
    if (!userId && !customerInfo) {
      throw new Error("Customer info required for guest");
    }

    // 🔍 lấy book
    const bookIds = items.map((i) => i.bookId);

    const books = await Book.find({
      _id: { $in: bookIds },
    }).session(session);

    // ❌ check đủ book
    if (books.length !== items.length) {
      throw new Error("Some books not found");
    }

    // 🔥 build order items (snapshot)
    const orderItems = items.map((item) => {
      const book = books.find(
        (b) => b._id.toString() === item.bookId
      );

      if (!book) throw new Error("Book not found");

      if (item.quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      // ❗ check stock
      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for ${book.title}`);
      }

      const finalPrice = book.finalPrice || book.price;

      return {
        bookId: book._id,
        title: book.title,
        thumbnail: book.thumbnail,
        price: book.price,
        finalPrice,
        quantity: item.quantity,
        total: finalPrice * item.quantity,
      };
    });

    // 💰 pricing
    const pricing = calculatePricing(orderItems);

    // 🔥 update stock
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(
        item.bookId,
        {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
          },
        },
        { session }
      );
    }

    // 🧾 create order
    const order = await Order.create(
      [
        {
          orderCode: generateOrderCode(),
          userId: userId || null,
          customerInfo,
          items: orderItems,
          ...pricing,
          payment: {
            method: paymentMethod || "cod",
            status: "pending",
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const createdOrder = order[0];

    // Send confirmation email in background-like flow: do not fail order creation if email fails.
    try {
      await sendOrderConfirmationEmail(createdOrder);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError?.message || emailError);
    }

    return createdOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const validFlow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping", "cancelled"],
    shipping: ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!validFlow[order.status].includes(status)) {
    throw new Error("Invalid status transition");
  }

  order.status = status;

  // 💰 payment rule
  if (status === "completed" && order.payment.method !== "cod") {
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
  }

  await order.save();

  return order;
};

export const cancelOrder = async (orderId, user, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) throw new Error("Order not found");

    // 🔒 quyền
    if (
      user &&
      order.userId &&
      order.userId.toString() !== user._id.toString() &&
      !user.isAdmin
    ) {
      throw new Error("Not allowed");
    }

    // ❌ rule cancel
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new Error("Order cannot be cancelled");
    }

    // 🔥 rollback stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(
        item.bookId,
        {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
        { session }
      );
    }

    // 🔥 update order
    order.status = "cancelled";
    order.cancelRequest = {
      reason,
      status: "approved",
      requestedAt: new Date(),
      processedAt: new Date(),
    };

    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const refundOrder = async (orderId, data) => {
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  // ❌ rule
  if (!["cancelled", "completed"].includes(order.status)) {
    throw new Error("Refund not allowed");
  }

  const { amount, reason } = data;

  if (amount > order.finalAmount) {
    throw new Error("Invalid refund amount");
  }

  order.refund = {
    status: "completed",
    amount,
    reason,
    createdAt: new Date(),
    processedAt: new Date(),
  };

  await order.save();

  return order;
};

/**
 * 📦 GET ORDERS BY USER
 */
export const getOrdersByUser = async (userId) => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

/**
 * 🔍 GET ORDER DETAIL
 */
export const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  // ❗ chỉ owner hoặc admin
  if (
    order.userId &&
    order.userId.toString() !== user._id.toString() &&
    !user.isAdmin
  ) {
    throw new Error("Forbidden");
  }

  return order;
};

export const getOrderByCode = async (orderCode) => {
  const order = await Order.findOne({ orderCode });

  if (!order) throw new Error("Order not found");

  return order;
};

import Cart from "../cart/cart.model.js";

/**
 * 🔥 CHECKOUT FROM CART
 */
export const checkout = async (userId, data) => {
  // 1. lấy cart
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2. convert cart → order items
  const items = cart.items.map((item) => ({
    bookId: item.bookId.toString(),
    quantity: item.quantity,
  }));

  // 3. gọi createOrder (reuse logic)
  const order = await createOrder(
    {
      items,
      customerInfo: data.customerInfo,
      paymentMethod: data.paymentMethod,
    },
    userId
  );

  // 4. clear cart
  cart.items = [];
  await cart.save();

  return order;
};

export const guestCheckout = async (data) => {
  const { items, customerInfo, paymentMethod } = data;

  if (!items || items.length === 0) {
    throw new Error("Items required");
  }

  if (!customerInfo) {
    throw new Error("Customer info required");
  }

  // reuse createOrder
  const order = await createOrder(
    {
      items,
      customerInfo,
      paymentMethod,
    },
    null // 👈 guest
  );

  return order;
};


/**
 * ?? GET ALL ORDERS (ADMIN)
 */
export const getAllOrders = async () => {
  return Order.find({}).sort({ createdAt: -1 });
};
