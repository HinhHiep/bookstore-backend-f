import * as orderService from "./order.service.js";

/**
 * 🔥 CREATE ORDER
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(
      req.body,
      req.user?._id // có thể guest
    );

    return res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 📦 GET MY ORDERS
 * GET /api/orders/my
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id);

    return res.json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔍 GET ORDER DETAIL
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user
    );

    return res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔄 UPDATE STATUS (ADMIN)
 * PATCH /api/orders/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    return res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ❌ CANCEL ORDER
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.id,
      req.user,
      req.body.reason
    );

    return res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 💸 REFUND ORDER (ADMIN)
 * POST /api/orders/:id/refund
 */
export const refundOrder = async (req, res, next) => {
  try {
    const order = await orderService.refundOrder(
      req.params.id,
      req.body
    );

    return res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const order = await orderService.checkout(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const guestCheckout = async (req, res, next) => {
  try {
    const order = await orderService.guestCheckout(req.body);

    res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};











