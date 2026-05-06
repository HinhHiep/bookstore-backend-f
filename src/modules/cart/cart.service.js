import Cart from "./cart.model.js";
import Book from "../book/book.model.js";

/**
 * 🔍 GET CART (dynamic pricing)
 */
export const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const bookIds = cart.items.map((i) => i.bookId);

  const books = await Book.find({ _id: { $in: bookIds } });

  // 🔥 build lại items (KHÔNG dùng data trong DB)
  const items = cart.items
    .map((item) => {
      const book = books.find(
        (b) => b._id.toString() === item.bookId.toString()
      );

      // ❌ remove nếu book không tồn tại hoặc inactive
      if (!book || book.status !== "active") return null;

      const finalPrice = book.discountPrice || book.price;

      return {
        bookId: item.bookId,
        id: item.bookId,
        title: book.title,
        author: book.author,
        thumbnail: book.coverImage,
        image: book.coverImage,
        price: book.price,
        finalPrice,
        quantity: item.quantity,
        availableQuantity: book.quantity,
        total: finalPrice * item.quantity,
      };
    })
    .filter(Boolean);

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  return {
    items,
    totalAmount,
  };
};

export const addToCart = async (userId, { bookId, quantity }) => {
  if (!bookId) throw new Error("bookId is required");
  if (!quantity || quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const book = await Book.findById(bookId);

  if (!book || book.status !== "active") {
    throw new Error("Book not found");
  }

  if (book.quantity < quantity) {
    throw new Error("Not enough stock");
  }

  const existing = cart.items.find(
    (i) => i.bookId.toString() === bookId
  );

  if (existing) {
    const newQty = existing.quantity + quantity;

    if (newQty > book.quantity) {
      throw new Error("Exceed stock");
    }

    existing.quantity = newQty;
  } else {
    cart.items.push({
      bookId,
      quantity,
      title: book.title,
      thumbnail: book.coverImage,
    });
  }

  await cart.save();

  return true;
};

export const updateCartItem = async (userId, bookId, quantity) => {
  if (!quantity) throw new Error("Quantity required");

  const cart = await Cart.findOne({ userId });

  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(
    (i) => i.bookId.toString() === bookId
  );

  if (!item) throw new Error("Item not found");

  const book = await Book.findById(bookId);

  if (!book) throw new Error("Book not found");

  if (quantity <= 0) {
    // ❌ remove item
    cart.items = cart.items.filter(
      (i) => i.bookId.toString() !== bookId
    );
  } else {
    if (quantity > book.quantity) {
      throw new Error("Exceed stock");
    }

    item.quantity = quantity;
  }

  await cart.save();

  return true;
};

export const removeItem = async (userId, bookId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (i) => i.bookId.toString() !== bookId
  );

  await cart.save();

  return true;
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) return;

  cart.items = [];
  await cart.save();

  return true;
};


export const mergeCart = async (userId, guestItems) => {
  if (!Array.isArray(guestItems)) {
    throw new Error("Invalid cart data");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  // 🔍 lấy book để validate
  const bookIds = guestItems.map((i) => i.bookId);

  const books = await Book.find({ _id: { $in: bookIds } });

  for (const guestItem of guestItems) {
    const { bookId, quantity } = guestItem;

    if (!bookId || quantity <= 0) continue;

    const book = books.find(
      (b) => b._id.toString() === bookId
    );

    // ❌ skip nếu book không hợp lệ
    if (!book || book.status !== "active") continue;

    const existing = cart.items.find(
      (i) => i.bookId.toString() === bookId
    );

    if (existing) {
      const newQty = existing.quantity + quantity;

      existing.quantity = Math.min(newQty, book.quantity);
    } else {
      cart.items.push({
        bookId,
        quantity: Math.min(quantity, book.quantity),
        title: book.title,
        thumbnail: book.coverImage,
      });
    }
  }

  await cart.save();

  return true;
};
