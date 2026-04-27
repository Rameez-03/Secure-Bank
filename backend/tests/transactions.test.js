import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET         = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-32-chars-min!';
process.env.MONGODB_URI        = 'mongodb://localhost:27017/test';
process.env.NODE_ENV           = 'test';
process.env.ENCRYPTION_KEY     = 'a'.repeat(64);
process.env.FRONTEND_URL       = 'http://localhost:3000';
process.env.PORT               = '0';

jest.unstable_mockModule('mongoose', () => ({
  default: { connect: jest.fn().mockResolvedValue({}) },
}));

jest.unstable_mockModule('../src/models/userModel.js', () => ({
  default: {
    findOne:           jest.fn(),
    findById:          jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) }),
    create:            jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/transactionModel.js', () => ({
  default: {
    find:             jest.fn().mockResolvedValue([]),
    findOne:          jest.fn(),
    create:           jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany:       jest.fn(),
    countDocuments:   jest.fn().mockResolvedValue(0),
    aggregate:        jest.fn().mockResolvedValue([]),
  },
}));

const { default: app } = await import('../src/server.js');

// ─── Auth guard — no token ────────────────────────────────────────────────────

describe('Transaction routes — no token', () => {
  it('GET /api/transactions returns 401', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/transactions returns 401', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ amount: 50, description: 'Coffee', category: 'Food', date: '2026-01-01' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/transactions/:id returns 401', async () => {
    const res = await request(app).get('/api/transactions/some-id');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/transactions/:id returns 401', async () => {
    const res = await request(app).patch('/api/transactions/some-id').send({ amount: 10 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/transactions/:id returns 401', async () => {
    const res = await request(app).delete('/api/transactions/some-id');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── Auth guard — bad / expired tokens ───────────────────────────────────────

describe('Transaction routes — invalid token', () => {
  it('returns 401 with a malformed token string', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer this.is.not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a token signed by a different secret', async () => {
    const fakeToken = jwt.sign({ userId: 'fake-id' }, 'wrong-secret');
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  it('returns 401 with an expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: 'user-id-123' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });
});

// ─── Health check (smoke test for this test module) ──────────────────────────

describe('GET /health', () => {
  it('returns 200 and success status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
