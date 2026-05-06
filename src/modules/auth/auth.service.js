import User from "../user/user.model.js";
import { sendEmail } from "../../common/utils/email.js";
import jwt from "jsonwebtoken";
import {
  validateRegister,
  validateVerifyEmail,
  validateLogin,
  validateResetPassword,
} from "./auth.validator.js";

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
  // Validate input
  validateRegister(data);

  const { name, email, password } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const otp = generateOTP();
  console.log(`🔐 Generated OTP for ${email}: ${otp}`);

  try {
    const user = await User.create({
      name,
      email,
      password,
      verifyToken: otp,
      verifyExpireAt: Date.now() + 10 * 60 * 1000, // 10 phút
    });

    try {
      await sendEmail(
        email,
        "Verify your account",
        `<h3>Your OTP: ${otp}</h3>`
      );
      console.log(`📧 Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // Continue anyway - user can request OTP resend
    }

    return {
      message: "OTP sent to email",
      email: user.email,
    };
  } catch (error) {
    if (error.code === 11000) {
      const error = new Error("Email already registered");
      error.status = 409;
      throw error;
    }
    throw error;
  }
};

/**
 * ✅ VERIFY EMAIL
 */
export const verifyEmail = async ({ email, otp }) => {
  // Validate input
  validateVerifyEmail({ email, otp });

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (!user.verifyToken) {
    const error = new Error("Email already verified");
    error.status = 400;
    throw error;
  }

  if (user.verifyToken !== otp.toString()) {
    const error = new Error("Invalid OTP");
    error.status = 400;
    throw error;
  }

  if (user.verifyExpireAt < Date.now()) {
    const error = new Error("OTP has expired");
    error.status = 400;
    throw error;
  }

  user.isVerified = true;
  user.verifyToken = null;
  user.verifyExpireAt = null;

  await user.save();

  const token = generateToken(user);

  return {
    message: "Email verified successfully",
    user,
    accessToken: token,
  };
};

/**
 * 🔐 LOGIN (chỉ khi verified)
 */
export const login = async ({ email, password }) => {
  // Validate input
  validateLogin({ email, password });

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error("Please verify your email first");
    error.status = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (user.status === "banned") {
    const error = new Error("Your account has been banned");
    error.status = 403;
    throw error;
  }

  const token = generateToken(user);

  return {
    message: "Login successful",
    user,
    accessToken: token,
  };
};

/**
 * 🔁 FORGOT PASSWORD
 */
export const forgotPassword = async (email) => {
  if (!email) {
    const error = new Error("Email is required");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

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
    message: "Reset OTP sent to email",
    email: user.email,
  };
};

/**
 * 🔄 RESET PASSWORD
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  // Validate input
  validateResetPassword({ email, otp, newPassword });

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (!user.resetToken) {
    const error = new Error("No reset request found");
    error.status = 400;
    throw error;
  }

  if (user.resetToken !== otp.toString()) {
    const error = new Error("Invalid OTP");
    error.status = 400;
    throw error;
  }

  if (user.resetExpireAt < Date.now()) {
    const error = new Error("OTP has expired");
    error.status = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetExpireAt = null;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};