import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  },
  { timestamps: true }
);

// One favorite per user per property
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });
favoriteSchema.index({ property: 1, createdAt: -1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
