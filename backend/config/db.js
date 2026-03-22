import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let memReplSet = null;

async function connectMemoryDb() {
  if (!memReplSet) {
    memReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  }
  const uri = memReplSet.getUri();
  const conn = await mongoose.connect(uri, {
    dbName: "havenbridge_dev",
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB Connected (in-memory replset): ${conn.connection.host}`);
  return conn;
}

async function sanitizeGeoAndEnsureIndex() {
  // This fix is safe to run multiple times.
  // It prevents MongoDB errors like:
  // "Can't extract geo keys ... Point must be an array or object, instead got type missing"
  // which occur when docs have geo.type but are missing geo.coordinates.
  const disabled = String(process.env.DISABLE_GEO_SANITIZE || "").toLowerCase() === "true";
  if (disabled) return;

  try {
    const { default: Property } = await import("../models/Property.js");

    // 1) Unset malformed geo objects (geo exists but coordinates missing or incomplete)
    // Note: this is the exact shape causing production crashes.
    const cleanupRes = await Property.updateMany(
      {
        geo: { $exists: true },
        $or: [
          { "geo.coordinates": { $exists: false } },
          { "geo.coordinates.0": { $exists: false } },
          { "geo.coordinates.1": { $exists: false } },
        ],
      },
      { $unset: { geo: 1 } }
    );

    const cleaned = Number(cleanupRes?.modifiedCount || 0);
    if (cleaned > 0) {
      console.warn(`[geo] Cleaned ${cleaned} malformed property.geo record(s) (missing coordinates).`);
    }

    // 2) Ensure geo index is PARTIAL (documents without coordinates should not be indexed)
    // We recreate the index with the canonical name geo_2dsphere.
    const indexes = await Property.collection.indexes();
    const existing = indexes.find((idx) => idx?.key?.geo === "2dsphere");

    const needsRebuild =
      !existing ||
      existing.name !== "geo_2dsphere" ||
      !existing.partialFilterExpression ||
      String(existing.partialFilterExpression?.["geo.type"] || "") !== "Point";

    if (existing && needsRebuild) {
      try {
        await Property.collection.dropIndex(existing.name);
        console.warn(`[geo] Dropped legacy geo index: ${existing.name}`);
      } catch (e) {
        // ignore if it doesn't exist / already dropped
      }
    }

    if (needsRebuild) {
      await Property.collection.createIndex(
        { geo: "2dsphere" },
        {
          name: "geo_2dsphere",
          partialFilterExpression: {
            "geo.type": "Point",
            "geo.coordinates": { $exists: true },
          },
        }
      );
      console.log("[geo] Ensured partial 2dsphere index geo_2dsphere");
    }
  } catch (err) {
    console.warn("[geo] sanitize/index step failed (continuing):", err?.message || err);
  }
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  if (!primaryUri) {
    throw new Error("MONGO_URI is not set. Add it to backend/.env");
  }

  const maxAttempts = Number(process.env.MONGO_CONNECT_RETRIES || 5);
  const baseDelay = Number(process.env.MONGO_CONNECT_BASE_DELAY_MS || 1000);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      await sanitizeGeoAndEnsureIndex();
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying MongoDB connection in ${delay}ms...`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error("MongoDB primary connection failed after retries.");
    }
  }

  // Optional fallback DB (explicitly enabled)
  const useFallback = String(process.env.MONGO_USE_FALLBACK || "false").toLowerCase() === "true";
  if (useFallback) {
    try {
      const fallbackUri = process.env.MONGO_FALLBACK_URI || "mongodb://127.0.0.1:27017/realestate_db";
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);

      await sanitizeGeoAndEnsureIndex();
      return;
    } catch (fallbackErr) {
      console.error("MongoDB fallback connection failed:", fallbackErr?.message || fallbackErr);
    }
  }

  // Optional in-memory DB for local dev (explicitly enabled)
  // Useful when Atlas DNS/network is blocked (mongodb+srv requires TXT/SRV DNS queries).
  const useMemory = String(process.env.MONGO_USE_MEMORY || "false").toLowerCase() === "true";
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  if (useMemory && nodeEnv !== "production") {
    try {
      await connectMemoryDb();

      await sanitizeGeoAndEnsureIndex();
      return;
    } catch (memErr) {
      console.error("MongoDB in-memory connection failed:", memErr?.message || memErr);
    }
  }

  // Nothing worked — fail fast.
  throw new Error(
    "MongoDB connection failed. Check MONGO_URI, IP allowlist, credentials, and network."
  );
};

export default connectDB;
