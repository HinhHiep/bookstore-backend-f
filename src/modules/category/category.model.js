import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    // 🏷️ Tên danh mục
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔗 Slug (unique)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 📝 Mô tả
    description: {
      type: String,
      default: "",
    },

    // 🌳 Cấu trúc cây
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    ancestors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    level: {
      type: Number,
      default: 0,
    },

    // 🖼️ UI
    image: {
      type: String,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // 🔄 Trạng thái
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // 📊 Thống kê
    bookCount: {
      type: Number,
      default: 0,
      min: 0,
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
  },
  {
    timestamps: true,
  }
);


// ⚡ INDEX (rất quan trọng)
categorySchema.index({ parentId: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ name: "text", keywords: "text" });


// 🔥 BUILD TREE (middleware)
categorySchema.pre("save", async function () {
  // 🌳 root category
  if (!this.parentId) {
    this.ancestors = [];
    this.level = 0;
    return;
  }

  // 🔍 tìm parent
  const parent = await mongoose.model("Category").findById(this.parentId);

  if (!parent) {
    const error = new Error("Parent category not found");
    error.status = 404;
    throw error; // ❗ quan trọng
  }

  // 🌳 build tree
  this.ancestors = [...parent.ancestors, parent._id];
  this.level = parent.level + 1;
});


const Category = mongoose.model("Category", categorySchema);

export default Category;