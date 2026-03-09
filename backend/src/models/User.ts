import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { encryption, emailEncryption, plaidEncryption } from '../utils/encryption';
import config from '../config';

export interface IUser extends Document {
  email: string;
  emailHash: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  role: 'user' | 'admin';
  plaidAccessToken?: string;
  plaidItemId?: string;
  accountIds: string[];
  budget: number;
  preferences: {
    currency: string;
    notifications: boolean;
    dataSharing: boolean;
  };
  gdprConsent: {
    analytics: boolean;
    marketing: boolean;
    consentDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  
  // Virtual fields
  isLocked: boolean;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    // Encrypted email (PII)
    email: {
      type: String,
      required: true,
      set: (email: string) => emailEncryption.encrypt(email),
      get: (encrypted: string) => {
        try {
          return emailEncryption.decrypt(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    // Hashed email for indexing
    emailHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Password hash
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't return in queries by default
    },
    
    // Encrypted first name (PII)
    firstName: {
      type: String,
      required: true,
      set: (name: string) => encryption.encrypt(name),
      get: (encrypted: string) => {
        try {
          return encryption.decrypt(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    // Encrypted last name (PII)
    lastName: {
      type: String,
      required: true,
      set: (name: string) => encryption.encrypt(name),
      get: (encrypted: string) => {
        try {
          return encryption.decrypt(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    // Encrypted phone number (PII)
    phoneNumber: {
      type: String,
      set: (phone: string) => phone ? encryption.encrypt(phone) : undefined,
      get: (encrypted: string) => {
        if (!encrypted) return undefined;
        try {
          return encryption.decrypt(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    // Encrypted 2FA secret
    twoFactorSecret: {
      type: String,
      select: false,
      set: (secret: string) => secret ? encryption.encrypt(secret) : undefined,
      get: (encrypted: string) => {
        if (!encrypted) return undefined;
        try {
          return encryption.decrypt(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    
    // Encrypted Plaid access token
    plaidAccessToken: {
      type: String,
      select: false,
      set: (token: string) => token ? plaidEncryption.encryptAccessToken(token) : undefined,
      get: (encrypted: string) => {
        if (!encrypted) return undefined;
        try {
          return plaidEncryption.decryptAccessToken(encrypted);
        } catch {
          return encrypted;
        }
      },
    },
    
    plaidItemId: {
      type: String,
    },
    
    accountIds: [{
      type: String,
    }],
    
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    preferences: {
      currency: {
        type: String,
        default: 'GBP',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      dataSharing: {
        type: Boolean,
        default: false,
      },
    },
    
    gdprConsent: {
      analytics: {
        type: Boolean,
        default: false,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      consentDate: {
        type: Date,
      },
    },
    
    lastLogin: {
      type: Date,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    verificationToken: {
      type: String,
      select: false,
    },
    
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    
    resetPasswordToken: {
      type: String,
      select: false,
    },
    
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  // Increment attempts
  const updates: any = { $inc: { failedLoginAttempts: 1 } };
  
  // Lock account if max attempts reached
  const maxAttempts = config.security.maxLoginAttempts;
  const needsLock = this.failedLoginAttempts + 1 >= maxAttempts && !this.isLocked;
  
  if (needsLock) {
    updates.$set = { lockUntil: new Date(Date.now() + config.security.lockTime) };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Index for email lookup
userSchema.index({ emailHash: 1 });

// Index for Plaid item lookup
userSchema.index({ plaidItemId: 1 });

// Index for active users
userSchema.index({ isActive: 1, isVerified: 1 });

export default mongoose.model<IUser>('User', userSchema);