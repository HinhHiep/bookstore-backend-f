import jwt from "jsonwebtoken";
import User from "../../modules/user/user.model.js";

/**
 * 🔐 VERIFY TOKEN
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔍 lấy token từ header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ không có token
    if (!token) {
      const error = new Error("Not authorized, no token");
      error.status = 401;
      throw error;
    }

    // 🔐 verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 tìm user
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.status = 401;
      throw error;
    }

    // ❌ user bị banned
    if (user.status === "banned") {
      const error = new Error("Account is banned");
      error.status = 403;
      throw error;
    }

    // ✅ gắn vào request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};