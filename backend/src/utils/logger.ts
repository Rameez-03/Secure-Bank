import winston from 'winston';
import path from 'path';
import config from '../config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'secure-banking-api' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
    // Write security events to security.log
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'security.log'),
      level: 'warn',
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});

// Add console transport for non-production
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Security-specific logging methods
export const securityLogger = {
  logFailedLogin: (email: string, ip: string, reason: string) => {
    logger.warn('Failed login attempt', {
      event: 'FAILED_LOGIN',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  logSuccessfulLogin: (userId: string, email: string, ip: string) => {
    logger.info('Successful login', {
      event: 'SUCCESSFUL_LOGIN',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logAccountLocked: (email: string, ip: string) => {
    logger.warn('Account locked due to too many failed attempts', {
      event: 'ACCOUNT_LOCKED',
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logPasswordChange: (userId: string, ip: string) => {
    logger.info('Password changed', {
      event: 'PASSWORD_CHANGE',
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  log2FAEnabled: (userId: string, ip: string) => {
    logger.info('2FA enabled', {
      event: '2FA_ENABLED',
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  log2FADisabled: (userId: string, ip: string) => {
    logger.warn('2FA disabled', {
      event: '2FA_DISABLED',
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logUnauthorizedAccess: (path: string, ip: string, userId?: string) => {
    logger.warn('Unauthorized access attempt', {
      event: 'UNAUTHORIZED_ACCESS',
      path,
      ip,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  logDataExport: (userId: string, ip: string) => {
    logger.info('User data exported (GDPR)', {
      event: 'DATA_EXPORT',
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logDataDeletion: (userId: string, ip: string) => {
    logger.warn('User data deletion requested (GDPR)', {
      event: 'DATA_DELETION',
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logSuspiciousActivity: (description: string, userId?: string, ip?: string, details?: any) => {
    logger.error('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      description,
      userId,
      ip,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;