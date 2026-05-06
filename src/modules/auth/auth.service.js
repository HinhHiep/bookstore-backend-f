import crypto from "crypto";
import User from "../user/user.model.js";
import { sendEmail } from "../../common/utils/email.js";
import jwt from "jsonwebtoken";

/**
 * 🔑 Generate JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * 🔢 Generate OTP (6 số)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 🔥 REGISTER (gửi OTP)
 */
export const register = async (data) => {
  const { name, email, password } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const otp = generateOTP();

  const user = await User.create({
    name,
    email,
    password,
    verifyToken: otp,
    verifyExpireAt: Date.now() + 10 * 60 * 1000, // 10 phút
  });

  await sendEmail(
    email,
    "Verify your account",
    `<h3>Your OTP: ${otp}</h3>`
  );

  return {
    message: "OTP sent to email",
  };
};

/**
 * ✅ VERIFY EMAIL
 */
export const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    user.verifyToken !== otp ||
    user.verifyExpireAt < Date.now()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  user.isVerified = true;
  user.verifyToken = null;
  user.verifyExpireAt = null;

  await user.save();

  return {
    message: "Email verified successfully",
  };
};

/**
 * 🔐 LOGIN (chỉ khi verified)
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invalid credentials");

  if (!user.isVerified) {
    throw new Error("Please verify your email first");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user);

  return { user, token };
};

/**
 * 🔁 FORGOT PASSWORD
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const otp = generateOTP();

  user.resetToken = otp;
  user.resetExpireAt = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail(
    email,
    "Reset Password",
    `<h3>Your OTP: ${otp}</h3>`
  );

  return {
    message: "Reset OTP sent",
  };
};

/**
 * 🔄 RESET PASSWORD
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  if (
    user.resetToken !== otp ||
    user.resetExpireAt < Date.now()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetExpireAt = null;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};