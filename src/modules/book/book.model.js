import mongoose from "mongoose";

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    // 📚 Thông tin cơ bản
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // 👤 Tác giả
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },

    // 📂 Danh mục
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // 💰 Giá cả
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["VND", "USD", "EUR"],
      default: "VND",
    },

    // 📦 Kho hàng
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    sold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🖼️ Hình ảnh
    coverImage: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    // ⭐ Đánh giá
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 📖 Chi tiết xuất bản
    publisher: {
      type: String,
      default: "",
    },

    publishedDate: {
      type: Date,
      default: null,
    },

    pages: {
      type: Number,
      default: null,
      min: 0,
    },

    language: {
      type: String,
      default: "VI",
      enum: ["VI", "EN", "FR", "DE", "ES", "JA", "KO", "ZH"],
    },

    // 📋 Thông tin khác
    edition: {
      type: String,
      default: "",
    },

    format: {
      type: String,
      enum: ["paperback", "hardcover", "ebook"],
      default: "paperback",
    },

    // 🏷️ Trạng thái & Đặc biệt
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNew: {
      type: Boolean,
      default: false,
    },

    isDiscount: {
      type: Boolean,
      default: false,
    },

    // 🔍 Search + AI
    keywords: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ⚡ INDEXES
bookSchema.index({ slug: 1 }, { unique: true });
bookSchema.index({ isbn: 1 }, { sparse: true, unique: true });
bookSchema.index({ categoryId: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ isNew: 1 });
bookSchema.index({ isDiscount: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ sold: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index(
  { title: "text", author: "text", keywords: "text" },
  { language_override: "textLanguage" }
);

// 🔥 MIDDLEWARE - Auto generate slug nếu không có
bookSchema.pre("save", async function () {
  if (!this.slug) {
    const slugify = (await import("slugify")).default;
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }

  // Kiểm tra discount price hợp lệ
  if (this.discountPrice && this.discountPrice >= this.price) {
    const error = new Error("Discount price must be less than original price");
    error.status = 400;
    throw error;
  }
});

const Book = mongoose.model("Book", bookSchema);

export default Book;
