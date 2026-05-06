import * as cartService from "./cart.service.js";

/**
 * 🛒 GET CART
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user._id);

    return res.json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ➕ ADD TO CART
 * POST /api/cart
 */
export const addToCart = async (req, res, next) => {
  try {
    await cartService.addToCart(req.user._id, req.body);

    return res.status(201).json({
      status: "success",
      message: "Added to cart",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 🔄 UPDATE ITEM
 * PATCH /api/cart/:bookId
 */
export const updateItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    await cartService.updateCartItem(
      req.user._id,
      bookId,
      quantity
    );

    return res.json({
      status: "success",
      message: "Cart updated",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ❌ REMOVE ITEM
 * DELETE /api/cart/:bookId
 */
export const removeItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    await cartService.removeItem(req.user._id, bookId);

    return res.json({
      status: "success",
      message: "Item removed",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 🧹 CLEAR CART
 * DELETE /api/cart
 */
export const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user._id);

    return res.json({
      status: "success",
      message: "Cart cleared",
    });
  } catch (err) {
    next(err);
  }
};

export const mergeCart = async (req, res, next) => {
  try {
    await cartService.mergeCart(req.user._id, req.body.items);

    return res.json({
      status: "success",
      message: "Cart merged",
    });
  } catch (err) {
    next(err);
  }
};