import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import User from "../models/User.js";

import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

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

function mockNext() {
  const next = (err) => {
    next.err = err;
  };
  next.err = null;
  return next;
}

test("auth: signup -> blocks login until email verified -> verify -> login ok", async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  process.env.FRONTEND_BASE_URL = "http://localhost:5173";

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    // register
    const req1 = { body: { name: "A", email: "a@example.com", password: "VeryStrongPass_123" }, headers: { origin: "http://localhost:5173" } };
    const res1 = mockRes();
    const next1 = mockNext();
    await registerUser(req1, res1, next1);

    assert.equal(next1.err, null);
    assert.equal(res1.statusCode, 201);
    assert.equal(res1.body?.needsEmailVerification, true);

    const user = await User.findOne({ email: "a@example.com" });
    assert.ok(user);
    assert.equal(user.emailVerified, false);
    assert.ok(user.emailVerificationTokenHash);

    // login should be blocked
    const req2 = { body: { email: "a@example.com", password: "VeryStrongPass_123" } };
    const res2 = mockRes();
    const next2 = mockNext();
    await loginUser(req2, res2, next2);

    assert.equal(next2.err, null);
    assert.equal(res2.statusCode, 403);
    assert.equal(res2.body?.code, "EMAIL_NOT_VERIFIED");

    // verify email with a real token: create one manually so we can verify via controller
    // (the controller stores only the hash)
    const { createRandomToken } = await import("../utils/tokenUtils.js");
    const { token, tokenHash } = createRandomToken();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationTokenExpires = new Date(Date.now() + 60_000);
    await user.save();

    const req3 = { query: { token } };
    const res3 = mockRes();
    const next3 = mockNext();
    await verifyEmail(req3, res3, next3);

    assert.equal(next3.err, null);
    assert.equal(res3.statusCode, 200);

    const verified = await User.findOne({ email: "a@example.com" });
    assert.equal(verified.emailVerified, true);

    // login ok
    const req4 = { body: { email: "a@example.com", password: "VeryStrongPass_123", rememberMe: true } };
    const res4 = mockRes();
    const next4 = mockNext();
    await loginUser(req4, res4, next4);

    assert.equal(next4.err, null);
    assert.equal(res4.statusCode, 200);
    assert.ok(res4.body?.accessToken);
    assert.equal(res4.body?.user?.email, "a@example.com");
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});

test("auth: forgot password -> reset password works", async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  process.env.FRONTEND_BASE_URL = "http://localhost:5173";

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();

  await mongoose.connect(uri, { dbName: "test" });

  try {
    // seed user
    const user = await User.create({ name: "B", email: "b@example.com", password: "VeryStrongPass_123", emailVerified: true });

    // request reset
    const req1 = { body: { email: "b@example.com" }, headers: { origin: "http://localhost:5173" } };
    const res1 = mockRes();
    const next1 = mockNext();
    await forgotPassword(req1, res1, next1);

    assert.equal(next1.err, null);
    assert.equal(res1.statusCode, 200);

    const fresh = await User.findById(user._id);
    assert.ok(fresh.passwordResetTokenHash);

    // reset with known token (inject a new one we control)
    const { createRandomToken } = await import("../utils/tokenUtils.js");
    const { token, tokenHash } = createRandomToken();
    fresh.passwordResetTokenHash = tokenHash;
    fresh.passwordResetTokenExpires = new Date(Date.now() + 60_000);
    await fresh.save();

    const req2 = { body: { token, password: "EvenStrongerPass_456" } };
    const res2 = mockRes();
    const next2 = mockNext();
    await resetPassword(req2, res2, next2);

    assert.equal(next2.err, null);
    assert.equal(res2.statusCode, 200);

    // login with new password
    const req3 = { body: { email: "b@example.com", password: "EvenStrongerPass_456" } };
    const res3 = mockRes();
    const next3 = mockNext();
    await loginUser(req3, res3, next3);

    assert.equal(next3.err, null);
    assert.equal(res3.statusCode, 200);
    assert.ok(res3.body?.accessToken);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
