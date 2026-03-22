// Quick script to seed a user and sample properties via the running backend API
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function main() {
  console.log('Registering user...');
  const regRes = await post('/auth/register', {
    name: 'Test User',
    email: 'jabir2k1@gmail.com',
    password: 'TestPassword123!',
  });
  console.log('Register:', regRes.status, regRes.data?.message || regRes.data);

  // If user registered, we got a debugVerifyUrl - verify automatically
  if (regRes.data?.debugVerifyUrl) {
    const verifyUrl = regRes.data.debugVerifyUrl;
    const token = new URL(verifyUrl).searchParams.get('token');
    if (token) {
      const verifyRes = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`);
      const verifyData = await verifyRes.json().catch(() => null);
      console.log('Verify email:', verifyRes.status, verifyData?.message || verifyData);
    }
  }

  // Login to get token
  console.log('Logging in...');
  const loginRes = await post('/auth/login', {
    email: 'jabir2k1@gmail.com',
    password: 'TestPassword123!',
  });
  console.log('Login:', loginRes.status, loginRes.data?.message || (loginRes.data?.accessToken ? 'got token' : loginRes.data));

  const token = loginRes.data?.accessToken;
  if (!token) {
    console.log('No token, cannot create properties. Exiting.');
    return;
  }

  // Create sample properties
  const sampleProperties = [
    {
      title: 'Modern 3-Bedroom House in DHA',
      description: 'A beautiful modern house with garden and parking.',
      price: 25000000,
      location: 'DHA Phase 5, Lahore',
      propertyType: 'house',
      listingType: 'sale',
      bedrooms: 3,
      bathrooms: 2,
      area: 10,
      areaUnit: 'marla',
      features: ['garden', 'parking', 'security'],
    },
    {
      title: 'Luxury Apartment in Gulberg',
      description: 'Spacious apartment with city views.',
      price: 15000000,
      location: 'Gulberg III, Lahore',
      propertyType: 'apartment',
      listingType: 'sale',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      areaUnit: 'sqft',
      features: ['lift', 'security', 'gym'],
    },
    {
      title: 'Commercial Plot in Johar Town',
      description: 'Prime commercial plot on main road.',
      price: 50000000,
      location: 'Johar Town, Lahore',
      propertyType: 'plot',
      listingType: 'sale',
      area: 1,
      areaUnit: 'kanal',
      features: ['corner', 'main road'],
    },
  ];

  for (const prop of sampleProperties) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(prop),
    });
    const data = await res.json().catch(() => null);
    console.log('Property:', res.status, data?.title || data?.message || data);
  }

  console.log('Done seeding data!');
}

main().catch(console.error);
