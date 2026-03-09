import crypto from 'crypto';
import config from '../config';

/**
 * Encryption utility for PCI DSS compliance
 * Uses AES-256-GCM for field-level encryption
 */

const ALGORITHM = config.encryption.algorithm as string;
const KEY = Buffer.from(config.encryption.key, 'hex');

if (KEY.length !== 32) {
  throw new Error('Encryption key must be 32 bytes (64 hex characters)');
}

export const encryption = {
  /**
   * Encrypt sensitive data
   * @param text - Data to encrypt
   * @returns Encrypted string with IV and auth tag
   */
  encrypt(text: string): string {
    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher (cast to CipherGCM to access getAuthTag)
      const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv) as crypto.CipherGCM;
      
      // Encrypt data
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag for GCM mode
      const authTag = cipher.getAuthTag();
      
      // Combine IV + authTag + encrypted data
      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  },

  /**
   * Decrypt encrypted data
   * @param encryptedData - Encrypted string with IV and auth tag
   * @returns Decrypted string
   */
  decrypt(encryptedData: string): string {
    try {
      // Split the encrypted data
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  },

  /**
   * Hash sensitive data (one-way, for comparison)
   * @param text - Data to hash
   * @returns Hashed string
   */
  hash(text: string): string {
    return crypto
      .createHash('sha256')
      .update(text)
      .digest('hex');
  },

  /**
   * Generate cryptographically secure random token
   * @param length - Length of token in bytes (default 32)
   * @returns Random hex string
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Generate secure random password
   * @param length - Length of password (default 16)
   * @returns Random password
   */
  generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }
    
    return password;
  },

  /**
   * Mask sensitive data for logging
   * @param data - Data to mask
   * @param visibleChars - Number of visible characters at start/end
   * @returns Masked string
   */
  mask(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }
    
    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars * 2);
    
    return `${start}${masked}${end}`;
  },

  /**
   * Tokenize sensitive data (for PCI DSS compliance)
   * Generates a unique token that can be stored instead of actual data
   * @returns Unique token
   */
  tokenize(): string {
    return `tok_${this.generateToken(24)}`;
  },
};

/**
 * Email encryption utilities
 */
export const emailEncryption = {
  /**
   * Encrypt email for storage
   */
  encrypt(email: string): string {
    return encryption.encrypt(email.toLowerCase().trim());
  },

  /**
   * Decrypt email from storage
   */
  decrypt(encryptedEmail: string): string {
    return encryption.decrypt(encryptedEmail);
  },

  /**
   * Hash email for indexing (allows searching without decryption)
   */
  hash(email: string): string {
    return encryption.hash(email.toLowerCase().trim());
  },
};

/**
 * Plaid token encryption utilities
 */
export const plaidEncryption = {
  /**
   * Encrypt Plaid access token
   */
  encryptAccessToken(token: string): string {
    return encryption.encrypt(token);
  },

  /**
   * Decrypt Plaid access token
   */
  decryptAccessToken(encryptedToken: string): string {
    return encryption.decrypt(encryptedToken);
  },
};

export default encryption;