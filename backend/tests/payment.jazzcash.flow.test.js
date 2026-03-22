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

test('jazzcash: create payment -> webhook success marks paid', async () => {
  process.env.NODE_ENV = 'test';
  process.env.PAYMENT_PROVIDERS_ENABLED = 'jazzcash';
  process.env.JAZZCASH_MERCHANT_ID = 'jc_test';
  process.env.JAZZCASH_INTEGRITY_SALT = 'jc_salt';

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();
  await mongoose.connect(uri, { dbName: 'test' });

  try {
    const paymentController = await import('../controllers/paymentController.js');
    const Payment = (await import('../models/Payment.js')).default;

    // create payment
    const reqCreate = { body: { amount: 2000, currency: 'PKR', returnUrl: 'http://localhost/ok' }, user: null };
    const resCreate = mockRes();
    const nextCreate = mockNext();

    await paymentController.createJazzCashPayment(reqCreate, resCreate, nextCreate);

    assert.equal(resCreate.statusCode, 200);
    assert.ok(resCreate.body?.redirectUrl);
    const paymentId = resCreate.body.paymentId;
    const payment = await Payment.findById(paymentId);
    assert.ok(payment);

    // simulate webhook
    const payload = { transactionId: payment.providerTransactionId || 'unknown', ResponseCode: '000' };
    const reqHook = { body: payload, headers: { 'x-jazzcash-signature': 'sig' } };
    const resHook = mockRes();
    const nextHook = mockNext();

    await paymentController.jazzcashWebhook(reqHook, resHook, nextHook);

    const fresh = await Payment.findById(paymentId).lean();
    assert.equal(fresh.status, 'paid');
    assert.equal(fresh.webhookVerified, true);
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
