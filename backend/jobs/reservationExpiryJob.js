import Reservation from "../models/Reservation.js";
import Property from "../models/Property.js";

async function expireReservationsOnce() {
  const now = new Date();

  // Pending fee window expired OR active reservation expired
  const expired = await Reservation.find({
    status: { $in: ["pending_fee", "active"] },
    $or: [
      { status: "pending_fee", feeDueAt: { $lt: now } },
      { status: "active", reservationExpiry: { $lt: now } },
    ],
  }).select("_id property status").lean();

  if (!expired || expired.length === 0) return { expiredCount: 0 };

  const ids = expired.map((r) => r._id);

  await Reservation.updateMany(
    { _id: { $in: ids } },
    { $set: { status: "expired", expiredAt: now } }
  );

  // Release properties only if they are still pointing at the same reservation
  const bulk = expired.map((r) => ({
    updateOne: {
      filter: { currentReservation: r._id },
      update: { $set: { status: "available" }, $unset: { currentReservation: "" } },
    },
  }));

  if (bulk.length > 0) {
    await Property.bulkWrite(bulk, { ordered: false });
  }

  return { expiredCount: expired.length };
}

export function startReservationExpiryJob({ intervalMs = 60_000 } = {}) {
  // Run once on startup
  expireReservationsOnce().catch(() => {});

  const timer = setInterval(() => {
    expireReservationsOnce().catch(() => {});
  }, intervalMs);

  // Prevent keeping node alive on shutdown hooks
  timer.unref?.();
  return timer;
}

export { expireReservationsOnce };
