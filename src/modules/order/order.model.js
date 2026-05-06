import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * 📦 Order Item (snapshot)
 */
const orderItemSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    thumbnail: String,

    price: {
      type: Number,
      required: true,
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * 👤 Customer Info (snapshot)
 */
const customerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    address: {
      street: { type: String, required: true },
      ward: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { _id: false }
);

/**
 * 💳 Payment
 */
const paymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["cod", "bank", "momo"],
      default: "cod",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paidAt: Date,
    transactionId: String,
  },
  { _id: false }
);

/**
 * ❌ Cancel Request
 */
const cancelSchema = new Schema(
  {
    reason: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    requestedAt: Date,
    processedAt: Date,
  },
  { _id: false }
);

/**
 * 💸 Refund
 */
const refundSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["none", "pending", "completed", "rejected"],
      default: "none",
    },

    amount: {
      type: Number,
      default: 0,
    },

    reason: String,

    createdAt: Date,
    processedAt: Date,
  },
  { _id: false }
);

/**
 * 🧾 Order Schema
 */
const orderSchema = new Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // guest checkout
    },

    customerInfo: {
      type: customerSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Order must have at least 1 item"],
    },

    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    cancelRequest: {
      type: cancelSchema,
      default: null,
    },

    refund: {
      type: refundSchema,
      default: {
        status: "none",
        amount: 0,
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 📌 Indexing
 */
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * 🚫 Không cho update orderCode
 */
orderSchema.pre("save", function () {
  if (!this.isNew && this.isModified("orderCode")) {
    throw new Error("orderCode cannot be updated");
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;