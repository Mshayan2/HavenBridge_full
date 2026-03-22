// Seed data into the running backend via HTTP API calls
const BASE = "http://localhost:5000/api";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function main() {
  console.log("Registering test user...");
  const regRes = await post("/auth/register", {
    name: "Test User",
    email: "jabir2k1@gmail.com",
    password: "TestPassword123!",
  });
  console.log("Register result:", regRes.status, regRes.data?.message || regRes.data);

  // If user already exists, that's fine
  if (regRes.status === 400 && regRes.data?.message?.includes("already exists")) {
    console.log("User already exists, continuing...");
  }

  // Login as admin to create properties (we need a token)
  console.log("\nRegistering admin user...");
  const adminReg = await post("/auth/register", {
    name: "Admin User",
    email: "admin@havenbridge.local",
    password: "AdminPassword123!",
    role: "admin",
  });
  console.log("Admin register:", adminReg.status, adminReg.data?.message || adminReg.data);

  // For properties, we need to be logged in. But the in-memory DB may require email verification.
  // Let's try to create properties as a simple test with the existing endpoints.

  // Actually, let's just verify the backend is responding and the user is registered.
  // The properties endpoint likely requires auth. For now, let's just test forgot-password.

  console.log("\nTesting forgot-password for jabir2k1@gmail.com...");
  const fpRes = await post("/auth/forgot-password", { email: "jabir2k1@gmail.com" });
  console.log("Forgot password result:", fpRes.status, fpRes.data);

  console.log("\nDone! Check your email for the reset link.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
