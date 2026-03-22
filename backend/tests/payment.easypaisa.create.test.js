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

test('easypaisa: create payment -> returns redirectUrl and creates Payment', async () => {
  process.env.NODE_ENV = 'test';
  process.env.PAYMENT_PROVIDERS_ENABLED = 'easypaisa';
  process.env.EASYPAYSA_MERCHANT_ID = 'test_merchant';
  process.env.EASYPAYSA_CALLBACK_SECRET = 'test_secret';

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();
  await mongoose.connect(uri, { dbName: 'test' });

  try {
    const { createEasyPaisaPayment } = await import('../controllers/paymentController.js');
    const Payment = (await import('../models/Payment.js')).default;

    const req = { body: { amount: 1000, currency: 'PKR', returnUrl: 'http://localhost/ok' }, user: null };
    const res = mockRes();
    const next = mockNext();

    await createEasyPaisaPayment(req, res, next);

    assert.equal(next.err, null);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body?.redirectUrl, 'Expected redirectUrl in response');
    assert.ok(res.body?.paymentId, 'Expected paymentId in response');

    const payment = await Payment.findById(res.body.paymentId).lean();
    assert.ok(payment, 'Payment should exist in DB');
    assert.equal(payment.provider, 'easypaisa');
    assert.equal(payment.status, 'pending');
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
});
