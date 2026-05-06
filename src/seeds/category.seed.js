import dotenv from "dotenv";
import Category from "../modules/category/category.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedCategories = async () => {
  try {
    await connectDB();

    await Category.deleteMany();
    console.log("🗑️ Old categories removed");

    // 🌳 ROOT CATEGORIES
    const vanHoc = await Category.create({
      name: "Văn học",
      slug: "van-hoc",
      description: "Thể loại phản ánh đời sống, tâm lý và xã hội.",
      image: "https://example.com/vanhoc.jpg",
      sortOrder: 1,
      isFeatured: true,
      status: "active",
      bookCount: 120,
      keywords: ["văn học", "literature", "fiction"],
      tags: ["van-hoc", "literature"],
    });

    const kinhTe = await Category.create({
      name: "Kinh tế",
      slug: "kinh-te",
      description: "Sách về kinh doanh, tài chính, đầu tư và quản trị.",
      image: "https://example.com/kinhte.jpg",
      sortOrder: 2,
      isFeatured: true,
      status: "active",
      bookCount: 80,
      keywords: ["kinh tế", "business", "finance"],
      tags: ["kinh-te", "business"],
    });

    const congNghe = await Category.create({
      name: "Công nghệ",
      slug: "cong-nghe",
      description: "Sách về lập trình, AI, dữ liệu và đổi mới công nghệ.",
      image: "https://example.com/congnghe.jpg",
      sortOrder: 3,
      isFeatured: true,
      status: "active",
      bookCount: 95,
      keywords: ["công nghệ", "technology", "programming"],
      tags: ["cong-nghe", "technology"],
    });

    const khoaHoc = await Category.create({
      name: "Khoa học",
      slug: "khoa-hoc",
      description: "Sách về khoa học tự nhiên, xã hội và kiến thức thực nghiệm.",
      image: "https://example.com/khoahoc.jpg",
      sortOrder: 4,
      isFeatured: true,
      status: "active",
      bookCount: 70,
      keywords: ["khoa học", "science", "research"],
      tags: ["khoa-hoc", "science"],
    });

    const ngheThuat = await Category.create({
      name: "Nghệ thuật",
      slug: "nghe-thuat",
      description: "Sách về hội họa, âm nhạc, nhiếp ảnh và sáng tạo.",
      image: "https://example.com/nghethuat.jpg",
      sortOrder: 5,
      isFeatured: true,
      status: "active",
      bookCount: 65,
      keywords: ["nghệ thuật", "art", "creative"],
      tags: ["nghe-thuat", "art"],
    });

    const phatTrienBanThan = await Category.create({
      name: "Phát triển bản thân",
      slug: "phat-trien-ban-than",
      description: "Sách kỹ năng sống, thói quen, tư duy và cải thiện bản thân.",
      image: "https://example.com/phattrienbanthan.jpg",
      sortOrder: 6,
      isFeatured: true,
      status: "active",
      bookCount: 90,
      keywords: ["phát triển", "self-help", "personal growth"],
      tags: ["phat-trien-ban-than", "self-help"],
    });

    // 🌿 Văn học
    await Category.create({
      name: "Tiểu thuyết",
      slug: "tieu-thuyet",
      description: "Sách truyện dài với cốt truyện, nhân vật và thế giới phong phú.",
      parentId: vanHoc._id,
      image: "https://example.com/tieu-thuyet.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 30,
      keywords: ["tiểu thuyết", "novel", "fiction"],
      tags: ["tieu-thuyet", "novel"],
    });

    await Category.create({
      name: "Truyện ngắn",
      slug: "truyen-ngan",
      description: "Các tuyển tập truyện ngắn sâu sắc và giàu cảm xúc.",
      parentId: vanHoc._id,
      image: "https://example.com/truyen-ngan.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 18,
      keywords: ["truyện ngắn", "short story", "flash fiction"],
      tags: ["truyen-ngan", "short-story"],
    });

    await Category.create({
      name: "Ngôn tình",
      slug: "ngon-tinh",
      description: "Truyện tình cảm lãng mạn, ngọt ngào và cảm động.",
      parentId: vanHoc._id,
      image: "https://example.com/ngon-tinh.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 22,
      keywords: ["ngôn tình", "romance", "love story"],
      tags: ["ngon-tinh", "romance"],
    });

    await Category.create({
      name: "Văn học Việt Nam",
      slug: "van-hoc-viet-nam",
      description: "Tuyển chọn tác phẩm văn học Việt Nam tiêu biểu.",
      parentId: vanHoc._id,
      image: "https://example.com/vanhoc-vn.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 15,
      keywords: ["văn học Việt Nam", "Vietnam literature"],
      tags: ["van-hoc-viet-nam", "vietnam"],
    });

    // 🌿 Kinh tế
    await Category.create({
      name: "Đầu tư",
      slug: "dau-tu",
      description: "Sách hướng dẫn chiến lược đầu tư và quản lý tài sản.",
      parentId: kinhTe._id,
      image: "https://example.com/dau-tu.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 20,
      keywords: ["đầu tư", "investment", "finance"],
      tags: ["dau-tu", "investment"],
    });

    await Category.create({
      name: "Marketing",
      slug: "marketing",
      description: "Sách về chiến lược thị trường và xây dựng thương hiệu.",
      parentId: kinhTe._id,
      image: "https://example.com/marketing.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 16,
      keywords: ["marketing", "branding", "sales"],
      tags: ["marketing", "branding"],
    });

    await Category.create({
      name: "Khởi nghiệp",
      slug: "khoi-nghiep",
      description: "Sách về xây dựng startup và phát triển doanh nghiệp.",
      parentId: kinhTe._id,
      image: "https://example.com/khoi-nghiep.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 14,
      keywords: ["khởi nghiệp", "startup", "entrepreneurship"],
      tags: ["khoi-nghiep", "startup"],
    });

    await Category.create({
      name: "Quản trị doanh nghiệp",
      slug: "quan-tri-doanh-nghiep",
      description: "Sách về quản trị, lãnh đạo và vận hành doanh nghiệp.",
      parentId: kinhTe._id,
      image: "https://example.com/quan-tri.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 12,
      keywords: ["quản trị", "management", "leadership"],
      tags: ["quan-tri", "management"],
    });

    // 🌿 Công nghệ
    await Category.create({
      name: "Lập trình",
      slug: "lap-trinh",
      description: "Sách học ngôn ngữ lập trình và phát triển phần mềm.",
      parentId: congNghe._id,
      image: "https://example.com/lap-trinh.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 25,
      keywords: ["lập trình", "programming", "coding"],
      tags: ["lap-trinh", "programming"],
    });

    await Category.create({
      name: "AI & Data",
      slug: "ai-data",
      description: "Sách về trí tuệ nhân tạo, dữ liệu và phân tích.",
      parentId: congNghe._id,
      image: "https://example.com/ai-data.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 20,
      keywords: ["AI", "data", "machine learning"],
      tags: ["ai", "data"],
    });

    await Category.create({
      name: "Thiết kế",
      slug: "thiet-ke",
      description: "Sách về thiết kế UI/UX, đồ họa và trải nghiệm.",
      parentId: congNghe._id,
      image: "https://example.com/thiet-ke.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 13,
      keywords: ["thiết kế", "design", "UI/UX"],
      tags: ["thiet-ke", "design"],
    });

    await Category.create({
      name: "Công nghệ web",
      slug: "cong-nghe-web",
      description: "Sách về phát triển web, front-end, back-end và API.",
      parentId: congNghe._id,
      image: "https://example.com/cong-nghe-web.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 18,
      keywords: ["web", "frontend", "backend"],
      tags: ["web", "development"],
    });

    // 🌿 Khoa học
    await Category.create({
      name: "Toán học",
      slug: "toan-hoc",
      description: "Sách lý thuyết và ứng dụng toán học.",
      parentId: khoaHoc._id,
      image: "https://example.com/toan-hoc.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 14,
      keywords: ["toán học", "mathematics", "math"],
      tags: ["toan-hoc", "math"],
    });

    await Category.create({
      name: "Vật lý",
      slug: "vat-ly",
      description: "Sách về vật lý cổ điển và hiện đại.",
      parentId: khoaHoc._id,
      image: "https://example.com/vat-ly.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 12,
      keywords: ["vật lý", "physics", "science"],
      tags: ["vat-ly", "physics"],
    });

    await Category.create({
      name: "Sinh học",
      slug: "sinh-hoc",
      description: "Sách về sinh học, y sinh và khoa học đời sống.",
      parentId: khoaHoc._id,
      image: "https://example.com/sinh-hoc.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 11,
      keywords: ["sinh học", "biology", "life science"],
      tags: ["sinh-hoc", "biology"],
    });

    await Category.create({
      name: "Khoa học xã hội",
      slug: "khoa-hoc-xa-hoi",
      description: "Sách về xã hội học, tâm lý học và nhân văn.",
      parentId: khoaHoc._id,
      image: "https://example.com/khoa-hoc-xa-hoi.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 13,
      keywords: ["xã hội", "psychology", "humanities"],
      tags: ["khoa-hoc-xa-hoi", "social-science"],
    });

    // 🌿 Nghệ thuật
    await Category.create({
      name: "Hội họa",
      slug: "hoi-hoa",
      description: "Sách về hội họa, màu sắc và kỹ thuật vẽ.",
      parentId: ngheThuat._id,
      image: "https://example.com/hoi-hoa.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 10,
      keywords: ["hội họa", "painting", "art"],
      tags: ["hoi-hoa", "painting"],
    });

    await Category.create({
      name: "Âm nhạc",
      slug: "am-nhac",
      description: "Sách về lý thuyết âm nhạc và sáng tác.",
      parentId: ngheThuat._id,
      image: "https://example.com/am-nhac.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 10,
      keywords: ["âm nhạc", "music", "composition"],
      tags: ["am-nhac", "music"],
    });

    await Category.create({
      name: "Nhiếp ảnh",
      slug: "nhiep-anh",
      description: "Sách về kỹ thuật chụp ảnh và hậu kỳ.",
      parentId: ngheThuat._id,
      image: "https://example.com/nhiep-anh.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 9,
      keywords: ["nhiếp ảnh", "photography", "photo"],
      tags: ["nhiep-anh", "photography"],
    });

    await Category.create({
      name: "Kiến trúc",
      slug: "kien-truc",
      description: "Sách về kiến trúc, không gian và thiết kế xây dựng.",
      parentId: ngheThuat._id,
      image: "https://example.com/kien-truc.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 12,
      keywords: ["kiến trúc", "architecture", "design"],
      tags: ["kien-truc", "architecture"],
    });

    // 🌿 Phát triển bản thân
    await Category.create({
      name: "Kỹ năng sống",
      slug: "ky-nang-song",
      description: "Sách về kỹ năng giao tiếp, quản lý và cuộc sống.",
      parentId: phatTrienBanThan._id,
      image: "https://example.com/ky-nang-song.jpg",
      sortOrder: 1,
      isFeatured: false,
      status: "active",
      bookCount: 18,
      keywords: ["kỹ năng sống", "life skills", "soft skills"],
      tags: ["ky-nang-song", "life-skills"],
    });

    await Category.create({
      name: "Thói quen",
      slug: "thoi-quen",
      description: "Sách về thói quen tốt và xây dựng lối sống tích cực.",
      parentId: phatTrienBanThan._id,
      image: "https://example.com/thoi-quen.jpg",
      sortOrder: 2,
      isFeatured: false,
      status: "active",
      bookCount: 16,
      keywords: ["thói quen", "habits", "routine"],
      tags: ["thoi-quen", "habits"],
    });

    await Category.create({
      name: "Tư duy tích cực",
      slug: "tu-duy-tich-cuc",
      description: "Sách về tư duy, động lực và phát triển tinh thần.",
      parentId: phatTrienBanThan._id,
      image: "https://example.com/tu-duy-tich-cuc.jpg",
      sortOrder: 3,
      isFeatured: false,
      status: "active",
      bookCount: 14,
      keywords: ["tư duy", "positive thinking", "mindset"],
      tags: ["tu-duy-tich-cuc", "mindset"],
    });

    await Category.create({
      name: "Sách kỹ năng lãnh đạo",
      slug: "ky-nang-lanh-dao",
      description: "Sách về lãnh đạo, quản lý đội nhóm và phát triển bản thân.",
      parentId: phatTrienBanThan._id,
      image: "https://example.com/lanh-dao.jpg",
      sortOrder: 4,
      isFeatured: false,
      status: "active",
      bookCount: 13,
      keywords: ["lãnh đạo", "leadership", "management"],
      tags: ["ky-nang-lanh-dao", "leadership"],
    });

    console.log("✅ Seed full categories success");
    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedCategories();