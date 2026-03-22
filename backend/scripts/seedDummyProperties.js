import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';

dotenv.config();

async function main() {
  await connectDB();

  // Ensure admin2 user
  const adminEmail = 'admin2@example.com';
  const adminPassword = 'Admin@123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: 'Admin Two', email: adminEmail, password: adminPassword, role: 'admin' });
    console.log('Created admin2:', adminEmail);
  } else {
    // Ensure role and password if explicitly requested
    admin.role = 'admin';
    await admin.save();
    console.log('Ensured admin2 exists:', adminEmail);
  }

  // Create two customers
  const buyers = [];
  const buyerData = [
    { name: 'Buyer One', email: 'buyer1@example.com', password: 'Buyer@123' },
    { name: 'Buyer Two', email: 'buyer2@example.com', password: 'Buyer@123' },
  ];
  for (const b of buyerData) {
    let u = await User.findOne({ email: b.email });
    if (!u) {
      u = await User.create({ name: b.name, email: b.email, password: b.password, role: 'customer' });
      console.log('Created buyer:', b.email);
    }
    buyers.push(u);
  }

  // Create 3 dummy properties
  const props = [];
  for (let i = 1; i <= 3; i++) {
    const title = `Dummy Plot ${i}`;
    let p = await Property.findOne({ title, createdBy: admin._id });
    if (!p) {
      p = await Property.create({
        title,
        description: `This is a test dummy property ${i} created for QA.`,
        price: 1000000 + i * 50000,
        area: 1200 + i * 100,
        location: `Test Locality ${i}`,
        type: 'plot',
        featured: i === 1,
        bedrooms: 0,
        bathrooms: 0,
        features: ['test', 'dummy'],
        images: [],
        createdBy: admin._id,
        approval: { status: 'approved', reviewedBy: admin._id, reviewedAt: new Date() },
      });
      console.log('Created property:', title);
    } else {
      console.log('Property already exists:', title);
    }
    props.push(p);
  }

  // Create some booking requests from buyers
  const bookings = [];
  const now = Date.now();
  if (props.length > 0) {
    // buyer1 books prop1 and prop2
    const b1 = await Booking.create({
      property: props[0]._id,
      customer: buyers[0]._id,
      bookingType: 'visit',
      bookingDate: new Date(now + 2 * 24 * 3600 * 1000),
      visitTime: '10:00',
      contactPhone: '+911234567890',
      contactEmail: buyers[0].email,
      guests: 2,
      status: 'pending',
      notes: 'QA booking 1',
    });
    bookings.push(b1);

    const b2 = await Booking.create({
      property: props[1]._id,
      customer: buyers[1]._id,
      bookingType: 'reserve',
      bookingDate: new Date(now + 3 * 24 * 3600 * 1000),
      visitTime: '15:00',
      contactPhone: '+919876543210',
      contactEmail: buyers[1].email,
      guests: 1,
      status: 'pending',
      notes: 'QA reservation request',
    });
    bookings.push(b2);
  }

  console.log('Summary:');
  console.log('Admin2:', admin.email, admin._id.toString());
  console.log('Properties created:', props.map(p => ({ title: p.title, id: p._id.toString() })));
  console.log('Bookings created:', bookings.map(b => ({ id: b._id.toString(), property: b.property.toString(), customer: b.customer.toString() })));

  await process.exit(0);
}

main().catch(err => {
  console.error('seedDummyProperties error:', err);
  process.exit(1);
});
