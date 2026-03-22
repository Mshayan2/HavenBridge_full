import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }],

    lastMessageAt: { type: Date, index: true },
    lastMessageText: { type: String },

    // Unread counts keyed by userId string
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ property: 1, buyer: 1, seller: 1 }, { unique: true });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
