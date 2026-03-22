import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_seen",
        "booking_responded",
        "booking_status_changed",
        "payment_paid",
        "payment_released",
        "property_approved",
        "property_rejected",
        "saved_search_match",
        "message_received",
        "lease_requested",
        "lease_approved",
        "lease_rejected",
        "rent_payment_paid",
      ],
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    data: {
      booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
      property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
      payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
      meta: { type: mongoose.Schema.Types.Mixed },
    },

    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
