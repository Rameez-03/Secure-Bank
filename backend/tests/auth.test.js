import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

// Set required env vars before any module is dynamically imported
process.env.JWT_SECRET       = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-32-chars-min!';
process.env.MONGODB_URI      = 'mongodb://localhost:27017/test';
process.env.NODE_ENV         = 'test';
process.env.ENCRYPTION_KEY   = 'a'.repeat(64);
process.env.FRONTEND_URL     = 'http://localhost:3000';
process.env.PORT             = '0';

// --- Mock fns (defined before unstable_mockModule so we can control them per-test) ---
const mockFindOne         = jest.fn();
const mockCreate          = jest.fn();
const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({});
const mockFindById        = jest.fn();

// --- Register mocks before dynamic import ---
jest.unstable_mockModule('mongoose', () => ({
  default: { connect: jest.fn().mockResolvedValue({}) },
}));

jest.unstable_mockModule('../src/models/userModel.js', () => ({
  default: {
    findOne:          mockFindOne,
    create:           mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findById:         mockFindById,
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/transactionModel.js', () => ({
  default: {
    find:              jest.fn().mockResolvedValue([]),
    findOne:           jest.fn(),
    create:            jest.fn(),
    findOneAndUpdate:  jest.fn(),
    findOneAndDelete:  jest.fn(),
    deleteMany:        jest.fn(),
    countDocuments:    jest.fn().mockResolvedValue(0),
    aggregate:         jest.fn().mockResolvedValue([]),
  },
}));

const { default: app } = await import('../src/server.js');

// ─── Registration — input validation (no DB calls for these) ─────────────────

describe('POST /api/auth/register — validation', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'ValidPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', password: 'ValidPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'not-an-email', password: 'ValidPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Short1!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password has no uppercase letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'nouppercase123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password has no special character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'NoSpecialChar123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Registration — DB-backed tests ──────────────────────────────────────────

describe('POST /api/auth/register — database', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockFindByIdAndUpdate.mockResolvedValue({});
  });

  it('returns 400 when email is already registered', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existing-id', email: 'taken@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'taken@example.com', password: 'ValidPass123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('returns 201 and an access token on successful registration', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: { toString: () => 'new-user-id-123' },
      name: 'Test User',
      email: 'new@example.com',
      budget: 0,
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'new@example.com', password: 'ValidPass123!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('new@example.com');
  });
});

// ─── Login — input validation (no DB calls) ───────────────────────────────────

describe('POST /api/auth/login — validation', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'SomePass123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bademail', password: 'SomePass123!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login — DB-backed tests ─────────────────────────────────────────────────

describe('POST /api/auth/login — database', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockFindByIdAndUpdate.mockResolvedValue({});
  });

  it('returns 401 when user does not exist', async () => {
    // findOne().select() chain — return null (user not found)
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'ValidPass123!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('returns 423 and remaining minutes when account is locked', async () => {
    const lockedUser = {
      _id: { toString: () => 'locked-user-id' },
      email: 'locked@example.com',
      failedLoginAttempts: 5,
      lockUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    };
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(lockedUser) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'locked@example.com', password: 'AnyPass123!' });

    expect(res.status).toBe(423);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/locked/i);
    expect(res.body.message).toMatch(/minute/i);
  });
});

// ─── Auth guards ─────────────────────────────────────────────────────────────

describe('Protected routes — no token', () => {
  it('GET /api/auth/me returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/logout returns 401 without a token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
