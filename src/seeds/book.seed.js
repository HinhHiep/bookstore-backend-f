import dotenv from "dotenv";
import Book from "../modules/book/book.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedBooks = async () => {
  try {
    await connectDB();

    const categoryId = "69f999791768ce6fdb821b55";

    const existingIndexes = await Book.collection.indexes();
    const oldTextIndex = existingIndexes.find((idx) => {
      return idx.key && Object.values(idx.key).includes("text");
    });

    if (oldTextIndex && oldTextIndex.name !== "_id_") {
      await Book.collection.dropIndex(oldTextIndex.name);
      console.log(`🧹 Dropped old text index: ${oldTextIndex.name}`);
    }

    await Book.syncIndexes();
    console.log("🔧 Synced book indexes with schema");

    await Book.deleteMany({ categoryId });
    console.log("🗑️ Old books in category removed");

    const books = [
  {
    "title": "Nhà Giả Kim",
    "slug": "nha-gia-kim",
    "description": "Cuốn tiểu thuyết nổi tiếng kể về hành trình theo đuổi ước mơ và khám phá ý nghĩa cuộc sống của chàng chăn cừu Santiago.",
    "author": "Paulo Coelho",
    "isbn": "9786047741385",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 120000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 100,
    "sold": 45,
    "coverImage": "https://example.com/books/nha-gia-kim-cover.jpg",
    "images": [
      "https://example.com/books/nha-gia-kim-1.jpg",
      "https://example.com/books/nha-gia-kim-2.jpg",
      "https://example.com/books/nha-gia-kim-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Hội Nhà Văn",
    "publishedDate": "2013-01-01T00:00:00.000Z",
    "pages": 228,
    "language": "VI",
    "edition": "Tái bản 2023",
    "format": "paperback",
    "status": "active",
    "isFeatured": true,
    "isNew": true,
    "isDiscount": false,
    "keywords": ["tiểu thuyết", "truyền cảm hứng", "best seller"],
    "tags": ["novel", "fiction", "self-discovery"],
    "sortOrder": 1
  },
  {
    "title": "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    "slug": "tuoi-tre-dang-gia-bao-nhieu",
    "description": "Một cuốn tiểu thuyết truyền cảm hứng dành cho giới trẻ về hành trình trưởng thành và theo đuổi đam mê.",
    "author": "Rosie Nguyễn",
    "isbn": "9786047729826",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 95000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 120,
    "sold": 60,
    "coverImage": "https://example.com/books/tuoi-tre-cover.jpg",
    "images": [
      "https://example.com/books/tuoi-tre-1.jpg",
      "https://example.com/books/tuoi-tre-2.jpg",
      "https://example.com/books/tuoi-tre-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Hội Nhà Văn",
    "publishedDate": "2018-05-10T00:00:00.000Z",
    "pages": 285,
    "language": "VI",
    "edition": "Tái bản 2022",
    "format": "paperback",
    "status": "active",
    "isFeatured": true,
    "isNew": false,
    "isDiscount": false,
    "keywords": ["tuổi trẻ", "truyền cảm hứng", "kỹ năng sống"],
    "tags": ["novel", "youth", "motivation"],
    "sortOrder": 2
  },
  {
    "title": "Rừng Na Uy",
    "slug": "rung-na-uy",
    "description": "Tiểu thuyết nổi tiếng của Haruki Murakami kể về tuổi trẻ, tình yêu và những mất mát.",
    "author": "Haruki Murakami",
    "isbn": "9786045699442",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 145000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 80,
    "sold": 32,
    "coverImage": "https://example.com/books/rung-na-uy-cover.jpg",
    "images": [
      "https://example.com/books/rung-na-uy-1.jpg",
      "https://example.com/books/rung-na-uy-2.jpg",
      "https://example.com/books/rung-na-uy-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Văn Học",
    "publishedDate": "2019-03-01T00:00:00.000Z",
    "pages": 490,
    "language": "VI",
    "edition": "Bìa mềm",
    "format": "paperback",
    "status": "active",
    "isFeatured": false,
    "isNew": false,
    "isDiscount": false,
    "keywords": ["murakami", "tiểu thuyết nhật", "tình yêu"],
    "tags": ["fiction", "japanese novel", "romance"],
    "sortOrder": 3
  },
  {
    "title": "Đắc Nhân Tâm",
    "slug": "dac-nhan-tam",
    "description": "Tác phẩm nổi tiếng về nghệ thuật giao tiếp và ứng xử trong cuộc sống.",
    "author": "Dale Carnegie",
    "isbn": "9786046841079",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 110000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 140,
    "sold": 85,
    "coverImage": "https://example.com/books/dac-nhan-tam-cover.jpg",
    "images": [
      "https://example.com/books/dac-nhan-tam-1.jpg",
      "https://example.com/books/dac-nhan-tam-2.jpg",
      "https://example.com/books/dac-nhan-tam-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Trẻ",
    "publishedDate": "2016-01-01T00:00:00.000Z",
    "pages": 320,
    "language": "VI",
    "edition": "Tái bản",
    "format": "paperback",
    "status": "active",
    "isFeatured": true,
    "isNew": false,
    "isDiscount": false,
    "keywords": ["giao tiếp", "kỹ năng sống", "best seller"],
    "tags": ["self-help", "communication", "classic"],
    "sortOrder": 4
  },
  {
    "title": "Mắt Biếc",
    "slug": "mat-biec",
    "description": "Một trong những tiểu thuyết nổi tiếng nhất của Nguyễn Nhật Ánh về tuổi học trò và tình yêu đơn phương.",
    "author": "Nguyễn Nhật Ánh",
    "isbn": "9786042098170",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 98000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 110,
    "sold": 75,
    "coverImage": "https://example.com/books/mat-biec-cover.jpg",
    "images": [
      "https://example.com/books/mat-biec-1.jpg",
      "https://example.com/books/mat-biec-2.jpg",
      "https://example.com/books/mat-biec-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Trẻ",
    "publishedDate": "2019-12-01T00:00:00.000Z",
    "pages": 290,
    "language": "VI",
    "edition": "Bản đặc biệt",
    "format": "paperback",
    "status": "active",
    "isFeatured": true,
    "isNew": true,
    "isDiscount": false,
    "keywords": ["tuổi học trò", "tình yêu", "nguyễn nhật ánh"],
    "tags": ["novel", "romance", "vietnamese literature"],
    "sortOrder": 5
  },
  {
    "title": "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
    "slug": "cho-toi-xin-mot-ve-di-tuoi-tho",
    "description": "Tác phẩm nhẹ nhàng, hài hước và sâu sắc về tuổi thơ của Nguyễn Nhật Ánh.",
    "author": "Nguyễn Nhật Ánh",
    "isbn": "9786041234567",
    "categoryId": "69f999791768ce6fdb821b55",
    "price": 89000,
    "discountPrice": null,
    "currency": "VND",
    "quantity": 130,
    "sold": 68,
    "coverImage": "https://example.com/books/tuoi-tho-cover.jpg",
    "images": [
      "https://example.com/books/tuoi-tho-1.jpg",
      "https://example.com/books/tuoi-tho-2.jpg",
      "https://example.com/books/tuoi-tho-3.jpg"
    ],
    "rating": 0,
    "reviewCount": 0,
    "publisher": "NXB Trẻ",
    "publishedDate": "2020-06-15T00:00:00.000Z",
    "pages": 240,
    "language": "VI",
    "edition": "Tái bản 2023",
    "format": "paperback",
    "status": "active",
    "isFeatured": false,
    "isNew": true,
    "isDiscount": false,
    "keywords": ["tuổi thơ", "nguyễn nhật ánh", "văn học việt nam"],
    "tags": ["novel", "childhood", "fiction"],
    "sortOrder": 6
  }
];

    await Book.insertMany(books);
    console.log("✅ Seed books successfully completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedBooks();
