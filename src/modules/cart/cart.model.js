import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * 📦 Cart Item
 * - KHÔNG lưu price (theo spec)
 * - chỉ lưu bookId + quantity + cache UI
 */
const cartItemSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🔹 optional (cache UI)
    title: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: false }
);

/**
 * 🛒 Cart Schema
 */
const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // mỗi user chỉ có 1 cart
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 📌 Index
 */

/**
 * 🚫 Validate: không cho quantity <= 0
 */
cartSchema.pre("save", function () {
  this.items.forEach((item) => {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
  });
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;