/**
 * 🔐 AUTH VALIDATION
 */

export const validateRegister = (data) => {
  const { name, email, password } = data;

  const errors = [];

  // Kiểm tra name
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }

  // Kiểm tra email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email is required");
  }

  // Kiểm tra password
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.status = 400;
    throw error;
  }
};

export const validateVerifyEmail = (data) => {
  const { email, otp } = data;

  if (!email || !otp) {
    const error = new Error("Email and OTP are required");
    error.status = 400;
    throw error;
  }

  if (otp.toString().length !== 6) {
    const error = new Error("OTP must be 6 digits");
    error.status = 400;
    throw error;
  }
};

export const validateLogin = (data) => {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }
};

export const validateResetPassword = (data) => {
  const { email, otp, newPassword } = data;

  if (!email || !otp || !newPassword) {
    const error = new Error("Email, OTP and new password are required");
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters");
    error.status = 400;
    throw error;
  }
};
