import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// Tests should be deterministic and fast.
// Auto index creation can briefly lock collections in replset mode, causing flaky failures on CI/Windows.
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

import User from "../models/User.js";
import Property from "../models/Property.js";
import Lease from "../models/Lease.js";

import { requestLease, approveLease } from "../controllers/leaseController.js";

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("lease flow: tenant requests and landlord approves", async () => {
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    const landlord = await User.create({ name: "Landlord", email: "landlord@example.com", password: "pass1234", role: "customer" });
    const tenant = await User.create({ name: "Tenant", email: "tenant@example.com", password: "pass1234", role: "customer" });

    const property = await Property.create({
      title: "Rentable home",
      description: "Nice place",
      price: 10000000,
      area: 5,
      location: "Lahore",
      type: "house",
      status: "available",
      createdBy: landlord._id,
      approval: { status: "approved", reviewedBy: landlord._id, reviewedAt: new Date() },
      rental: { enabled: true, monthlyRentMinor: 250000, depositMinor: 500000, currency: "pkr", minTermMonths: 6 },
    });

    // Tenant requests
    const req1 = {
      body: { propertyId: property._id.toString(), termMonths: 6, startDate: new Date().toISOString().slice(0, 10), message: "Interested" },
      user: tenant,
    };
    const res1 = mockRes();
    await requestLease(req1, res1);

    assert.equal(res1.statusCode, 201);
    assert.ok(res1.body?._id);
    assert.equal(res1.body.status, "pending");

    const leaseId = res1.body._id;

    // Landlord approves
    const req2 = {
      params: { id: leaseId },
      body: { startDate: new Date().toISOString().slice(0, 10), termMonths: 6 },
      user: landlord,
    };
    const res2 = mockRes();
    await approveLease(req2, res2);

    assert.equal(res2.statusCode, 200, `approveLease failed: ${JSON.stringify(res2.body)}`);
    assert.equal(res2.body.status, "active");
    assert.ok(Array.isArray(res2.body.installments));
    // deposit + 6 rents
    assert.equal(res2.body.installments.length, 7);

    const freshProperty = await Property.findById(property._id).lean();
    assert.equal(String(freshProperty.status), "rented");

    const lease = await Lease.findById(leaseId).lean();
    assert.equal(String(lease.status), "active");
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});

test("lease request blocked when property not rent-enabled", async () => {
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    const landlord = await User.create({ name: "Landlord", email: "landlord2@example.com", password: "pass1234", role: "customer" });
    const tenant = await User.create({ name: "Tenant", email: "tenant2@example.com", password: "pass1234", role: "customer" });

    const property = await Property.create({
      title: "Sale only",
      description: "No rent",
      price: 10000000,
      area: 5,
      location: "Lahore",
      type: "house",
      status: "available",
      createdBy: landlord._id,
      approval: { status: "approved", reviewedBy: landlord._id, reviewedAt: new Date() },
      rental: { enabled: false, currency: "pkr" },
    });

    const req1 = { body: { propertyId: property._id.toString(), termMonths: 6 }, user: tenant };
    const res1 = mockRes();
    await requestLease(req1, res1);

    assert.equal(res1.statusCode, 400);
    assert.match(String(res1.body?.message || ""), /not enabled/i);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
