import { describe, it, expect, beforeAll } from '@jest/globals';
import { encrypt, decrypt, isEncrypted, safeDecrypt } from '../src/utils/encrypt.js';

// Encrypt utility is pure crypto — no DB, no server, just needs the key env var
beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'a'.repeat(64);
});

describe('encrypt()', () => {
  it('returns a colon-delimited string with three parts', () => {
    const result = encrypt('test-token');
    const parts = result.split(':');
    expect(parts).toHaveLength(3);
  });

  it('IV part is 32 hex characters (16 bytes)', () => {
    const [iv] = encrypt('test-token').split(':');
    expect(iv).toHaveLength(32);
    expect(iv).toMatch(/^[0-9a-f]+$/);
  });

  it('produces different ciphertext on each call (random IV)', () => {
    const a = encrypt('same-plaintext');
    const b = encrypt('same-plaintext');
    expect(a).not.toBe(b);
  });
});

describe('decrypt()', () => {
  it('recovers the original plaintext', () => {
    const original = 'access-token-abc123';
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it('handles special characters and long strings', () => {
    const token = 'abc!@#$%^&*()-_=+[]{};:,.<>?/|`~xyz'.repeat(5);
    expect(decrypt(encrypt(token))).toBe(token);
  });

  it('throws on malformed input (missing parts)', () => {
    expect(() => decrypt('only-two:parts')).toThrow();
  });

  it('throws when ciphertext is tampered with', () => {
    const encrypted = encrypt('sensitive-data');
    const parts = encrypted.split(':');
    parts[2] = 'deadbeef' + parts[2].slice(8);
    expect(() => decrypt(parts.join(':'))).toThrow();
  });
});

describe('isEncrypted()', () => {
  it('returns true for a value produced by encrypt()', () => {
    expect(isEncrypted(encrypt('plaid-token'))).toBe(true);
  });

  it('returns false for a plain string', () => {
    expect(isEncrypted('access-1234567890abcdef')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isEncrypted(null)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isEncrypted('')).toBe(false);
  });
});

describe('safeDecrypt()', () => {
  it('decrypts a properly encrypted value', () => {
    const token = 'my-plaid-access-token';
    expect(safeDecrypt(encrypt(token))).toBe(token);
  });

  it('passes through a plaintext value unchanged (legacy migration path)', () => {
    const legacyToken = 'access-sandbox-legacy-token-12345';
    expect(safeDecrypt(legacyToken)).toBe(legacyToken);
  });
});
