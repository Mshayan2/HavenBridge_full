import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in backend/.env");
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email });
if (existing) {
  existing.role = "admin";
  if (!existing.name) existing.name = name;
  // Only set password if explicitly requested
  if (process.env.ADMIN_FORCE_PASSWORD === "true") {
    existing.password = password;
  }
  await existing.save();
  console.log(`Admin ensured: ${email}`);
} else {
  await User.create({ name, email, password, role: "admin" });
  console.log(`Admin created: ${email}`);
}

await mongoose.connection.close();
process.exit(0);
