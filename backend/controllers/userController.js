// backend/controllers/userController.js
import User from "../models/User.js";

// GET /api/users  (admin)
export async function getUsers(req, res, next) {
  try {
    // exclude sensitive fields like password
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id/role  (admin)
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Missing 'role' in body" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    const sanitized = user.toObject();
    delete sanitized.password;

    res.json(sanitized);
  } catch (err) {
    next(err);
  }
}
