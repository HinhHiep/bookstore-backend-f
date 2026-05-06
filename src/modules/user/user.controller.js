import * as userService from "./user.service.js";

/**
 * 👤 GET PROFILE
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getMyProfile(req.user._id);

    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ✏️ UPDATE PROFILE
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(
      req.user._id,
      req.body
    );

    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 📦 ADD ADDRESS
 */
export const addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addAddress(
      req.user._id,
      req.body
    );

    res.json({
      status: "success",
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 🔄 UPDATE ADDRESS
 */
export const updateAddress = async (req, res, next) => {
  try {
    const addresses = await userService.updateAddress(
      req.user._id,
      req.params.id,
      req.body
    );

    res.json({
      status: "success",
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ❌ DELETE ADDRESS
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await userService.deleteAddress(
      req.user._id,
      req.params.id
    );

    res.json({
      status: "success",
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ⭐ SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const addresses = await userService.setDefaultAddress(
      req.user._id,
      req.params.id
    );

    res.json({
      status: "success",
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};