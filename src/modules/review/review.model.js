import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    // 📚 Book reference
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    // 👤 User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ⭐ Rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 💬 Comment
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    // 🔄 Status
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ rating: 1 });

// ❗ Rule: 1 user chỉ review 1 lần / book
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
// ❗ Validation: rating phải từ 1 đến 5
reviewSchema.path("rating").validate(function (value) {
  return value >= 1 && value <= 5;
}, "Rating must be between 1 and 5");

// 🔥 Model
const Review = mongoose.model("Review", reviewSchema);

export default Review;