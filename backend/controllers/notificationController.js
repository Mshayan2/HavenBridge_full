import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const includeRead = String(req.query.includeRead || "false").toLowerCase() === "true";

  const query = { user: req.user._id };
  if (!includeRead) query.readAt = { $exists: false };

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("data.booking")
    .populate("data.property")
    .populate("data.payment");

  res.status(200).json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ message: "Notification not found" });

  if (!n.readAt) n.readAt = new Date();
  await n.save();

  res.status(200).json(n);
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  res.status(200).json({ ok: true });
};
