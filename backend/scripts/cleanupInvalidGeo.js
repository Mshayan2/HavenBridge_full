import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import connectDB from '../config/db.js';

dotenv.config();

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB, cleaning up invalid geo fields on properties...');
    const res = await Property.updateMany(
      { $or: [ { 'geo': { $exists: true, $eq: {} } }, { 'geo.type': { $exists: true }, $or: [ { 'geo.coordinates': { $exists: false } }, { 'geo.coordinates': { $size: 0 } }, { $expr: { $ne: [ { $size: { $ifNull: ["$geo.coordinates", []] } }, 2 ] } } ] } ] },
      { $unset: { geo: "" } }
    );
    console.log('Update result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
})();
