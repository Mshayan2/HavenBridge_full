import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Route (Any logged in user)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // If password was changed after the token was issued, reject the token.
      // decoded.iat is in seconds since epoch.
      if (req.user.passwordChangedAt && decoded?.iat) {
        const pwdChangedAtSec = Math.floor(new Date(req.user.passwordChangedAt).getTime() / 1000);
        if (pwdChangedAtSec > decoded.iat) {
          return res.status(401).json({ message: "Not authorized, token expired (password changed)" });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Only Admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only" });
};

// Only Staff
export const staffOnly = (req, res, next) => {
  if (req.user && req.user.role === "staff") {
    return next();
  }
  return res.status(403).json({ message: "Staff access only" });
};

// Admin or Staff
export const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
    return next();
  }
  return res.status(403).json({ message: "Only staff or admin allowed" });
};
