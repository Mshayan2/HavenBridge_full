import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

async function notifyUsers(userIds, payload) {
  const uniq = Array.from(new Set((userIds || []).filter(Boolean).map(String)));
  if (uniq.length === 0) return;
  const docs = uniq.map((id) => ({ user: id, ...payload }));
  await Notification.insertMany(docs);
}

// GET all bookings (admin/staff)
export const getAllBookings = async (req, res) => {
  try {
    // Use lean + projection and a reasonable maxTimeMS to avoid long-running queries
    const projection = "property customer staff bookingType bookingDate visitTime contactPhone contactEmail guests status sellerViewedAt sellerRespondedAt notes createdAt updatedAt";
    const bookings = await Booking.find()
      .select(projection)
      .populate("property", "title location price")
      .populate("customer", "name email role")
      .populate("staff", "name email role")
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(8000);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("getAllBookings error:", error);
    const msg = error?.message || "Failed to fetch bookings";
    const isNetworkErr = String(msg).toLowerCase().includes("timed out") || String(error?.name).toLowerCase().includes("mongonetworkerror") || String(error?.name).toLowerCase().includes("networkerror");
    if (isNetworkErr) return res.status(503).json({ message: "Database temporarily unavailable. Please try again shortly." });
    res.status(500).json({ message: msg });
  }
};

// GET single booking by ID (admin/staff)
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property")
      .populate("customer", "-password")
      .populate("staff", "-password");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE booking (customer)
export const createBooking = async (req, res) => {
  try {
    const { property, bookingDate, notes, visitTime, contactPhone, contactEmail, guests, bookingType } = req.body;

    if (!property || !bookingDate) {
      return res.status(400).json({ message: "property and bookingDate are required" });
    }

    // Ensure property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) return res.status(404).json({ message: "Property not found" });

    // Public bookings should only be allowed for approved listings.
    // Back-compat: if approval is missing, treat as approved.
    if (propertyExists.approval && propertyExists.approval.status && propertyExists.approval.status !== "approved") {
      return res.status(400).json({ message: "This property is not available for booking right now." });
    }

    const normalizedType = bookingType === "reserve" ? "reserve" : "visit";

    // Enforce per-property reservation policy
    if (normalizedType === "reserve") {
      const reserveEnabled = propertyExists.reservation?.enabled;
      if (reserveEnabled === false) {
        return res.status(400).json({ message: "Reservations are disabled for this property." });
      }
    }

    const newBooking = await Booking.create({
      property,
      customer: req.user._id,
      bookingType: normalizedType,
      bookingDate,
      visitTime,
      contactPhone,
      contactEmail,
      guests,
      notes,
    });

    // Notify seller (property owner) + admins
    const admins = await User.find({ role: "admin" }).select("_id");
    const sellerId = propertyExists.createdBy;
    const kind = newBooking.bookingType === "reserve" ? "reservation" : "booking";
    await notifyUsers(
      [sellerId, ...admins.map((a) => a._id)],
      {
        type: "booking_created",
        title: `New ${kind} request`,
        message: `A new ${kind} request was submitted for: ${propertyExists.title || "your property"}`,
        data: { booking: newBooking._id, property: propertyExists._id },
      }
    );

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET bookings for properties owned by the logged-in user (seller view)
export const getBookingsForMyProperties = async (req, res) => {
  try {
    // First find the seller's property ids (cheap + indexed)
    const props = await Property.find({ createdBy: req.user._id }).select("_id").lean();
    const propIds = props.map((p) => p._id);
    if (propIds.length === 0) {
      return res.status(200).json([]);
    }

    // Query only bookings belonging to those properties
    const filtered = await Booking.find({ property: { $in: propIds } })
      .sort({ createdAt: -1 })
      .populate("property")
      .populate("customer", "name email role")
      .populate("staff", "name email role")
      .maxTimeMS(8000);

    // Mark unseen pending bookings as "seen" by the seller (once), and notify the buyer.
    // This is important UX: buyers should know their request was viewed.
    const now = new Date();
    const newlySeen = filtered.filter((b) => !b.sellerViewedAt && b.status === "pending");
    if (newlySeen.length > 0) {
      const ids = newlySeen.map((b) => b._id);

      // Persist seen timestamp
      await Booking.updateMany(
        { _id: { $in: ids }, sellerViewedAt: { $exists: false } },
        { $set: { sellerViewedAt: now } }
      );

      // Update response objects so seller UI reflects it immediately
      newlySeen.forEach((b) => {
        b.sellerViewedAt = now;
      });

      // Notify each buyer once
      await Promise.all(
        newlySeen.map((b) =>
          notifyUsers([b.customer?._id], {
            type: "booking_seen",
            title: "Seller viewed your booking request",
            message: `Your ${b.bookingType === "reserve" ? "reservation" : "booking"} request for ${b.property?.title || "a property"} was viewed.`,
            data: { booking: b._id, property: b.property?._id },
          })
        )
      );
    }

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller responds to a booking for their property (accept/decline)
export const respondToBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ensure the current user is the owner of the property
    const prop = await Property.findById(booking.property);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    if (!prop.createdBy || prop.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this booking" });
    }

    const { action, notes } = req.body; // action: 'confirm' | 'reject'
    const prevStatus = booking.status;

    if (!action || !["confirm", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    booking.status = action === "confirm" ? "confirmed" : "rejected";
    booking.sellerRespondedAt = new Date();
    if (!booking.sellerViewedAt) booking.sellerViewedAt = booking.sellerRespondedAt;
    if (notes) booking.notes = (booking.notes || "") + "\n" + notes;

    const updated = await booking.save();

    // notify customer + admins
    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyUsers(
      [updated.customer, prop.createdBy, ...admins.map((a) => a._id)],
      {
        type: "booking_responded",
        title: `${booking.status === "confirmed" ? "Booking confirmed" : "Booking rejected"}`,
        message: `${booking.bookingType === "reserve" ? "Your reservation request" : "Your booking request"} for ${prop.title || "property"} was ${booking.status}.${notes ? "\nReason: " + notes : ""}`,
        data: { booking: updated._id, property: prop._id },
      }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET bookings of logged-in customer
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("property")
      .populate("staff", "-password");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE booking (admin/staff)
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { bookingDate, status, notes, staff } = req.body;

    const prevStatus = booking.status;

    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.status = status || booking.status;
    booking.notes = notes || booking.notes;
    booking.staff = staff || booking.staff;

    const updatedBooking = await booking.save();

    // Notify customer/seller if status changed
    if (status && status !== prevStatus) {
      const prop = await Property.findById(updatedBooking.property);
      const admins = await User.find({ role: "admin" }).select("_id");
      const sellerId = prop?.createdBy;
      await notifyUsers(
        [updatedBooking.customer, sellerId, ...admins.map((a) => a._id)],
        {
          type: "booking_status_changed",
          title: "Booking status updated",
          message: `Booking status changed: ${prevStatus} → ${status}`,
          data: { booking: updatedBooking._id, property: updatedBooking.property },
        }
      );
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE booking (admin/staff)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await booking.deleteOne();
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE booking by customer (allow customers to cancel their own booking)
export const deleteMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the customer who created the booking may delete it
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    const prop = await Property.findById(booking.property);
    const admins = await User.find({ role: "admin" }).select("_id");
    const sellerId = prop?.createdBy;

    await booking.deleteOne();

    await notifyUsers(
      [sellerId, ...admins.map((a) => a._id)],
      {
        type: "booking_status_changed",
        title: "Booking cancelled",
        message: "A booking request was cancelled by the buyer.",
        data: { booking: booking._id, property: booking.property },
      }
    );
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
