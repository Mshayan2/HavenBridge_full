// Auto-seed users and properties if database is empty
import User from "../models/User.js";
import Property from "../models/Property.js";

export async function autoSeedIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    const propCount = await Property.countDocuments();

    if (userCount > 0 && propCount > 0) {
      return; // Already has data
    }

    console.log("[seed] Database is empty, seeding sample data...");

    // Create test user (already verified for easy testing)
    let user;
    if (userCount === 0) {
      user = await User.create({
        name: "Test User",
        email: "jabir2k1@gmail.com",
        password: "TestPassword123!",
        emailVerified: true, // Skip verification for dev
        role: "customer",
      });
      console.log("[seed] Created test user: jabir2k1@gmail.com / TestPassword123!");
    } else {
      user = await User.findOne();
    }

    // Create sample properties
    if (propCount === 0 && user) {
      const props = [
        {
          title: "Modern House in DHA",
          description: "Beautiful 3-bed house with garden and parking.",
          price: 25000000,
          location: "DHA Phase 5, Lahore",
          type: "house",
          status: "available",
          bedrooms: 3,
          bathrooms: 2,
          area: 10,
          features: ["garden", "parking", "security"],
          createdBy: user._id,
          approval: { status: "approved" },
        },
        {
          title: "Luxury Apartment in Gulberg",
          description: "Spacious apartment with city views.",
          price: 15000000,
          location: "Gulberg III, Lahore",
          type: "apartment",
          status: "available",
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          features: ["lift", "security", "gym"],
          createdBy: user._id,
          approval: { status: "approved" },
        },
        {
          title: "Commercial Plot in Johar Town",
          description: "Prime commercial plot on main road.",
          price: 50000000,
          location: "Johar Town, Lahore",
          type: "plot",
          status: "available",
          area: 1,
          features: ["corner", "main road"],
          createdBy: user._id,
          approval: { status: "approved" },
        },
      ];

      await Property.insertMany(props);
      console.log("[seed] Created", props.length, "sample properties");
    }

    console.log("[seed] Done!");
  } catch (err) {
    console.error("[seed] Auto-seed failed:", err?.message || err);
  }
}
