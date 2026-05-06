import OpenAI from "openai";

import Chat from "./chat.model.js";
import Book from "../book/book.model.js";

/**
 * 🤖 OpenRouter
 */
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",

  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * 🔍 Search books thông minh hơn
 * - luôn cố gắng trả về sách
 * - fallback nếu không match
 */
const searchBooks = async (message) => {
  // lowercase
  const text = message.toLowerCase().trim();

  // tách keyword
  const keywords = text
    .split(/\s+/)
    .filter((word) => word.length > 1);

  /**
   * 🎯 Query chính
   */
  let books = await Book.find({
    status: "active",

    $or: [
      {
        title: {
          $regex: keywords.join("|"),
          $options: "i",
        },
      },

      {
        description: {
          $regex: keywords.join("|"),
          $options: "i",
        },
      },

      {
        author: {
          $regex: keywords.join("|"),
          $options: "i",
        },
      },

      {
        keywords: {
          $in: keywords,
        },
      },

      {
        tags: {
          $in: keywords,
        },
      },
    ],
  })
    .sort({
      sold: -1,
      rating: -1,
      createdAt: -1,
    })
    .limit(5)
    .lean();

  /**
   * 🔥 Fallback 1
   * Nếu không có -> lấy featured
   */
  if (books.length === 0) {
    books = await Book.find({
      status: "active",

      isFeatured: true,
    })
      .sort({
        sold: -1,
        rating: -1,
      })
      .limit(5)
      .lean();
  }

  /**
   * 🔥 Fallback 2
   * Nếu vẫn không có -> lấy best seller
   */
  if (books.length === 0) {
    books = await Book.find({
      status: "active",
    })
      .sort({
        sold: -1,
        rating: -1,
        createdAt: -1,
      })
      .limit(5)
      .lean();
  }

  return books;
};

/**
 * 💬 Chat AI
 */
export const chatWithBot = async ({
  userId,
  chatId,
  message,
}) => {
  /**
   * 1. lấy chat
   */
  let chat = null;

  if (chatId) {
    chat = await Chat.findById(chatId);
  }

  /**
   * 2. chưa có -> tạo mới
   */
  if (!chat) {
    chat = await Chat.create({
      userId,
      messages: [],
    });
  }

  /**
   * 3. lưu user message
   */
  chat.messages.push({
    role: "user",
    content: message,
  });

  /**
   * 4. tìm sách
   */
  const books = await searchBooks(message);

  /**
   * 5. build context
   */
  const context = books
    .map(
      (book, index) => `
${index + 1}. ${book.title}

Tác giả: ${book.author}

Giá: ${book.price} VND

Mô tả: ${book.description}

Tags: ${book.tags?.join(", ") || ""}

Keywords: ${book.keywords?.join(", ") || ""}
`
    )
    .join("\n");

  /**
   * 6. build AI messages
   */
  const aiMessages = [
    {
      role: "system",
      content: `
Bạn là AI tư vấn sách cho website bán sách.

Yêu cầu:
- Trả lời bằng tiếng Việt
- Tư vấn tự nhiên
- Chỉ dùng sách trong dữ liệu
- Không bịa sách
- Ưu tiên gợi ý sách phù hợp nhất
- Trả lời thân thiện
`,
    },

    // history
    ...chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),

    // database context
    {
      role: "system",
      content: `
Danh sách sách hiện có:

${context}
`,
    },
  ];

  /**
   * 7. gọi AI
   */
  const response =
    await openai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",

      messages: aiMessages,
    });

  const answer =
    response.choices?.[0]?.message?.content ||
    "Xin lỗi, tôi chưa thể trả lời.";

  /**
   * 8. lưu AI response
   */
  chat.messages.push({
    role: "assistant",
    content: answer,
  });

  await chat.save();

  /**
   * 9. response
   */
  return {
    chatId: chat._id,

    answer,

    books,
  };
};