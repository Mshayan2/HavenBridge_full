import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

function ensureParticipant(conversation, userId) {
  const uid = String(userId);
  return (conversation?.participants || []).some((p) => String(p) === uid);
}

export const createOrGetConversation = async (req, res) => {
  const { propertyId } = req.body || {};
  if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ message: "propertyId is required" });
  }

  const property = await Property.findById(propertyId).select("createdBy title").lean();
  if (!property) return res.status(404).json({ message: "Property not found" });

  const buyerId = req.user._id;
  const sellerId = property.createdBy;

  if (!sellerId) return res.status(400).json({ message: "Property has no seller" });
  if (String(buyerId) === String(sellerId)) {
    return res.status(400).json({ message: "You cannot message yourself" });
  }

  let convo = await Conversation.findOne({ property: propertyId, buyer: buyerId, seller: sellerId })
    .populate("property", "title images location")
    .populate("buyer", "name email")
    .populate("seller", "name email");

  if (!convo) {
    try {
      convo = await Conversation.create({
        property: propertyId,
        buyer: buyerId,
        seller: sellerId,
        participants: [buyerId, sellerId],
        lastMessageAt: new Date(),
        lastMessageText: "",
        unread: {},
      });
      convo = await Conversation.findById(convo._id)
        .populate("property", "title images location")
        .populate("buyer", "name email")
        .populate("seller", "name email");
    } catch (e) {
      // Unique race — fetch again
      convo = await Conversation.findOne({ property: propertyId, buyer: buyerId, seller: sellerId })
        .populate("property", "title images location")
        .populate("buyer", "name email")
        .populate("seller", "name email");
    }
  }

  return res.status(200).json(convo);
};

export const listMyConversations = async (req, res) => {
  const uid = req.user._id;

  const list = await Conversation.find({ participants: uid })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate("property", "title images location")
    .populate("buyer", "name email")
    .populate("seller", "name email")
    .lean();

  // Add computed unread for current user
  const out = (list || []).map((c) => {
    const unread = Number(c?.unread?.[String(uid)] || 0);
    return { ...c, unreadCount: unread };
  });

  return res.status(200).json(out);
};

export const listMessages = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid conversation id" });

  const convo = await Conversation.findById(id);
  if (!convo) return res.status(404).json({ message: "Conversation not found" });
  if (!ensureParticipant(convo, req.user._id)) return res.status(403).json({ message: "Not allowed" });

  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const before = req.query.before ? new Date(String(req.query.before)) : null;

  const query = { conversation: convo._id };
  if (before && !Number.isNaN(before.getTime())) query.createdAt = { $lt: before };

  const msgs = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name email")
    .lean();

  return res.status(200).json({ items: msgs.reverse() });
};

export const sendMessage = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid conversation id" });

  const bodyRaw = req.body?.body;
  const body = String(bodyRaw || "").trim();
  if (!body) return res.status(400).json({ message: "Message body is required" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const convo = await Conversation.findById(id).session(session);
    if (!convo) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!ensureParticipant(convo, req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not allowed" });
    }

    const msg = await Message.create(
      [
        {
          conversation: convo._id,
          sender: req.user._id,
          body,
          readBy: [req.user._id],
        },
      ],
      { session }
    );

    const created = msg[0];

    convo.lastMessageAt = new Date();
    convo.lastMessageText = body.slice(0, 200);

    // Increment unread for the other participant
    const other = (convo.participants || []).find((p) => String(p) !== String(req.user._id));
    if (other) {
      const key = String(other);
      const prev = Number(convo.unread?.get(key) || 0);
      convo.unread.set(key, prev + 1);

      await Notification.create(
        [
          {
            user: other,
            type: "message_received",
            title: "New message",
            message: body.length > 120 ? `${body.slice(0, 117)}...` : body,
            data: {
              meta: { conversationId: convo._id, property: convo.property, from: req.user._id },
            },
          },
        ],
        { session }
      );
    }

    await convo.save({ session });
    await session.commitTransaction();

    const populated = await Message.findById(created._id).populate("sender", "name email").lean();
    return res.status(201).json(populated);
  } catch (e) {
    await session.abortTransaction();
    return res.status(500).json({ message: e?.message || "Failed to send message" });
  } finally {
    session.endSession();
  }
};

export const markConversationRead = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid conversation id" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const convo = await Conversation.findById(id).session(session);
    if (!convo) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!ensureParticipant(convo, req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not allowed" });
    }

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: convo._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } },
      { session }
    );

    // Reset unread counter
    const key = String(req.user._id);
    convo.unread.set(key, 0);
    await convo.save({ session });

    await session.commitTransaction();
    return res.status(200).json({ ok: true });
  } catch (e) {
    await session.abortTransaction();
    return res.status(500).json({ message: e?.message || "Failed to mark read" });
  } finally {
    session.endSession();
  }
};
