import mongoose from "mongoose";

const { Schema } = mongoose;

const promotionSchema = new Schema(
  {
    // 🎯 Thông tin cơ bản
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    // 💰 Giá trị chiết khấu
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // Phần trăm (%)
    },

    maxDiscount: {
      type: Number,
      default: null, // Giảm tối đa (VND hoặc số tiền)
      min: 0,
    },

    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn tối thiểu
      min: 0,
    },

    // 📅 Thời gian
    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    // 🏷️ Phạm vi áp dụng
    event: {
      type: String,
      default: null, // Tên sự kiện (flash_sale, holiday, seasonal, etc.)
      trim: true,
    },

    bookIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    // 📊 Sử dụng
    usageLimit: {
      type: Number,
      default: null, // Null = không giới hạn
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🔄 Trạng thái
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    isGlobal: {
      type: Boolean,
      default: false, // true = áp dụng cho tất cả sách
    },

    // 🔍 Metadata
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
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ bookIds: 1 });
promotionSchema.index({ event: 1 });
promotionSchema.index({ isGlobal: 1 });
promotionSchema.index({ createdAt: -1 });

// 🔥 MIDDLEWARE - Validation
promotionSchema.pre("save", async function () {
  // ✅ 1. Kiểm tra startDate < endDate
  if (this.startDate >= this.endDate) {
    const error = new Error("Start date must be before end date");
    error.status = 400;
    throw error;
  }

  // ✅ 2. Kiểm tra value hợp lệ
  if (this.value < 0 || this.value > 100) {
    const error = new Error("Promotion value must be between 0 and 100");
    error.status = 400;
    throw error;
  }

  // ✅ 3. Nếu bookIds rỗng → đây là global promotion
  if (!this.bookIds || this.bookIds.length === 0) {
    this.isGlobal = true;
  } else {
    this.isGlobal = false;
  }

  // ✅ 4. Reset usedCount nếu chưa bắt đầu
  const now = new Date();
  if (now < this.startDate) {
    this.usedCount = 0;
  }
});

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
