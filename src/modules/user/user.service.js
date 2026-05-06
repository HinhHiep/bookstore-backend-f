import User from "./user.model.js";

/**
 * 👤 GET MY PROFILE
 */
export const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return user;
};

/**
 * ✏️ UPDATE PROFILE
 */
export const updateProfile = async (userId, data) => {
  const { name, phone } = data;

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  return user;
};

/**
 * 📦 ADD ADDRESS
 */
export const addAddress = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  // nếu là default → reset các address khác
  if (data.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(data);

  await user.save();

  return user.addresses;
};

/**
 * 🔄 UPDATE ADDRESS
 */
export const updateAddress = async (userId, addressId, data) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);

  if (!address) {
    const error = new Error("Address not found");
    error.status = 404;
    throw error;
  }

  // nếu set default
  if (data.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, data);

  await user.save();

  return user.addresses;
};

/**
 * ❌ DELETE ADDRESS
 */
export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);

  if (!address) {
    const error = new Error("Address not found");
    error.status = 404;
    throw error;
  }

  address.deleteOne();

  await user.save();

  return user.addresses;
};

/**
 * ⭐ SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (userId, addressId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId;
  });

  await user.save();

  return user.addresses;
};