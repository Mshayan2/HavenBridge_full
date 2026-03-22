import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

function parseBool(v) {
  return String(v || "").toLowerCase() === "true";
}

(async () => {
  try {
    await connectDB();

    const dryRun = parseBool(process.env.DRY_RUN);
    const cutoffRaw = String(process.env.CUTOFF_DATE || "").trim();
    const cutoff = cutoffRaw ? new Date(cutoffRaw) : null;

    if (cutoff && Number.isNaN(cutoff.getTime())) {
      throw new Error("Invalid CUTOFF_DATE. Use an ISO date like 2025-12-31T00:00:00Z");
    }

    // Mark legacy accounts as verified:
    // - emailVerified is missing or false
    // - AND no active verification token is currently stored
    // - AND (optional) createdAt is before CUTOFF_DATE
    const filter = {
      $and: [
        { $or: [{ emailVerified: { $exists: false } }, { emailVerified: false }] },
        {
          $or: [
            { emailVerificationTokenHash: { $exists: false } },
            { emailVerificationTokenHash: null },
            { emailVerificationTokenHash: "" },
          ],
        },
      ],
    };

    if (cutoff) {
      filter.$and.push({ createdAt: { $lt: cutoff } });
    }

    const candidates = await User.countDocuments(filter);
    // eslint-disable-next-line no-console
    console.log(`[migrate] legacy users eligible: ${candidates}`);

    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log("[migrate] DRY_RUN=true, not applying changes.");
      return;
    }

    const result = await User.updateMany(filter, {
      $set: { emailVerified: true },
      $unset: { emailVerificationTokenHash: "", emailVerificationTokenExpires: "" },
    });

    // eslint-disable-next-line no-console
    console.log(`[migrate] updated: ${result.modifiedCount ?? result.nModified ?? 0}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[migrate] failed:", err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
