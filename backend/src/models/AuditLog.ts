import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  details?: any;
  changes?: {
    before?: any;
    after?: any;
  };
  success: boolean;
  errorMessage?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        // Authentication
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_RESET',
        'PASSWORD_CHANGE',
        '2FA_ENABLE',
        '2FA_DISABLE',
        '2FA_VERIFY',
        'EMAIL_VERIFY',
        'FAILED_LOGIN',
        'ACCOUNT_LOCKED',
        
        // User actions
        'PROFILE_VIEW',
        'PROFILE_UPDATE',
        'ACCOUNT_DELETE',
        'CONSENT_UPDATE',
        'DATA_EXPORT',
        'DATA_DELETE',
        
        // Plaid
        'BANK_LINK',
        'BANK_UNLINK',
        'TRANSACTIONS_SYNC',
        'BALANCE_CHECK',
        
        // Transactions
        'TRANSACTION_VIEW',
        'TRANSACTION_CREATE',
        'TRANSACTION_UPDATE',
        'TRANSACTION_DELETE',
        
        // Budget
        'BUDGET_UPDATE',
        'BUDGET_VIEW',
        
        // Admin
        'ADMIN_ACTION',
        'USER_VIEW_ADMIN',
        'AUDIT_LOG_VIEW',
        
        // Security
        'UNAUTHORIZED_ACCESS',
        'SUSPICIOUS_ACTIVITY',
        'RATE_LIMIT_EXCEEDED',
      ],
    },
    
    resource: {
      type: String,
      required: true,
      index: true,
    },
    
    resourceId: {
      type: String,
    },
    
    ipAddress: {
      type: String,
    },
    
    userAgent: {
      type: String,
    },
    
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
      index: true,
    },
    
    details: {
      type: Schema.Types.Mixed,
    },
    
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    
    success: {
      type: Boolean,
      default: true,
    },
    
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index to auto-delete old logs (optional - keep for 1 year)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);