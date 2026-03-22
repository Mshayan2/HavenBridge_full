import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

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
    send(payload) {
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

test('easypaisa: webhook -> verifies and marks payment paid', async () => {
  process.env.NODE_ENV = 'test';
  process.env.PAYMENT_PROVIDERS_ENABLED = 'easypaisa';
  process.env.EASYPAYSA_MERCHANT_ID = 'test_merchant';
  process.env.EASYPAYSA_CALLBACK_SECRET = 'test_secret';

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();
  await mongoose.connect(uri, { dbName: 'test' });

  try {
    // import after env set so config picks it up
    const paymentController = await import('../controllers/paymentController.js');
    const Payment = (await import('../models/Payment.js')).default;

    // create a payment record to simulate prior create
    const p = await Payment.create({
      purpose: 'booking_token',
      amount: 1000,
      currency: 'pkr',
      provider: 'easypaisa',
      status: 'pending',
      providerTransactionId: 'sim_txn_123',
    });

    const payload = { transactionId: 'sim_txn_123', status: 'SUCCESS' };
    const req = { body: payload, headers: { 'x-easypaisa-signature': 'sig' } };
    const res = mockRes();
    const next = mockNext();

    await paymentController.easypaisaWebhook(req, res, next);

    assert.equal(res.statusCode, 200);
    const fresh = await Payment.findById(p._id).lean();
    assert.equal(fresh.status, 'paid');
    assert.equal(fresh.webhookVerified, true);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
