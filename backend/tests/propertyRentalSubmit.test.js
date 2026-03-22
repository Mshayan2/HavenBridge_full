import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import User from "../models/User.js";
import Property from "../models/Property.js";
import { submitProperty } from "../controllers/propertyController.js";

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

test("submitProperty: listingType=rent persists rental fields", async () => {
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    const user = await User.create({
      name: "User",
      email: "u@example.com",
      password: "pass1234",
      role: "customer",
      emailVerified: true,
    });

    const req = {
      body: {
        title: "Apartment for rent",
        description: "Nice",
        price: "100000",
        location: "Lahore",
        type: "apartment",
        area: "5",
        listingType: "rent",
        rentalDeposit: "200000",
        rentalMinTermMonths: "12",
        rentalCurrency: "pkr",
        features: ["Parking"],
      },
      files: null,
      user,
    };

    const res = mockRes();
    await submitProperty(req, res);

    assert.equal(res.statusCode, 201, `Expected 201, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body?._id);

    const created = await Property.findById(res.body._id).lean();
    assert.ok(created);
    assert.equal(created.rental?.enabled, true);
    assert.equal(created.rental?.currency, "pkr");
    assert.equal(created.rental?.minTermMonths, 12);

    // 100000 PKR => 10000000 paisa
    assert.equal(created.rental?.monthlyRentMinor, 100000 * 100);
    assert.equal(created.rental?.depositMinor, 200000 * 100);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});

test("submitProperty: default is sale (rental disabled)", async () => {
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    const user = await User.create({
      name: "User2",
      email: "u2@example.com",
      password: "pass1234",
      role: "customer",
      emailVerified: true,
    });

    const req = {
      body: {
        title: "House for sale",
        description: "Nice",
        price: "10000000",
        location: "Lahore",
        type: "house",
        area: "10",
      },
      files: null,
      user,
    };

    const res = mockRes();
    await submitProperty(req, res);

    assert.equal(res.statusCode, 201);

    const created = await Property.findById(res.body._id).lean();
    assert.equal(created.rental?.enabled, false);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
