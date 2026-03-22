import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Reservation from "../models/Reservation.js";

dotenv.config();

async function main() {
  await connectDB();

  const coll = Reservation.collection;
  const indexes = await coll.indexes();
  const names = new Set(indexes.map((i) => i.name));

  // Old incorrect indexes (allowed one per status)
  const old = ["property_1_status_1", "customer_1_status_1"];
  for (const name of old) {
    if (names.has(name)) {
      // eslint-disable-next-line no-console
      console.log(`Dropping old index: ${name}`);
      try {
        await coll.dropIndex(name);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to drop index ${name}:`, e?.message || e);
      }
    }
  }

  // Rebuild indexes to match schema definition
  // This will create:
  // - property_1 (partial unique on pending_fee/active)
  // - customer_1 (partial unique on pending_fee/active)
  // plus any other defined indexes.
  const res = await Reservation.syncIndexes();
  // eslint-disable-next-line no-console
  console.log("syncIndexes result:", res);

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("migrateReservationIndexes error:", err);
  process.exit(1);
});
