# 🏦 Secure Banking App - Complete Setup Guide

A PCI DSS & GDPR compliant banking application built with Modern MERN stack.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Security Features](#security-features)
- [Compliance Features](#compliance-features)
- [AWS Deployment](#aws-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **MongoDB** >= 6.0 (or MongoDB Atlas account)
- **Redis** >= 7.0
- **Git**
- **Docker** (optional, for local development)

### Accounts Needed
- MongoDB Atlas account (free tier works)
- Plaid account (sandbox is free)
- AWS account (for deployment)
- Gmail account (for email notifications)

---

## 📁 Project Structure

```
secure-banking-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Transaction.ts
│   │   │   └── AuditLog.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── encryption.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── layouts/
│   │   └── services/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## 🚀 Backend Setup

### Step 1: Create Project Directory

```bash
mkdir secure-banking-app
cd secure-banking-app
mkdir backend
cd backend
```

### Step 2: Initialize Backend

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
# Production dependencies
npm install express mongoose redis bcrypt jsonwebtoken speakeasy qrcode helmet cors express-rate-limit express-validator express-mongo-sanitize winston morgan dotenv plaid nodemailer crypto-js hpp xss-clean

# Development dependencies
npm install -D @types/express @types/node @types/bcrypt @types/jsonwebtoken @types/cors @types/morgan @types/nodemailer @types/crypto-js @types/hpp typescript ts-node nodemon jest @types/jest ts-jest supertest @types/supertest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier
```

### Step 4: Create TypeScript Config

Copy the `tsconfig.json` from the artifacts I created earlier.

### Step 5: Create Directory Structure

```bash
mkdir -p src/{config,controllers,middleware,models,routes,services,utils,types}
mkdir -p tests logs
```

### Step 6: Copy Core Files

Copy these files from the artifacts:
- `src/config/index.ts`
- `src/config/database.ts`
- `src/config/redis.ts`
- `src/utils/logger.ts`
- `src/utils/encryption.ts`
- `src/models/User.ts`
- `src/models/Transaction.ts`
- `src/models/AuditLog.ts`

### Step 7: Setup Environment Variables

```bash
cp .env.example .env
```

**Generate secure keys:**

```bash
# Generate JWT secrets (64 bytes = 128 hex chars)
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key (32 bytes = 64 hex chars)
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env` and add your generated secrets.

### Step 8: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Ubuntu
sudo apt install mongodb-org
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### Step 9: Setup Redis

**Local Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

**Or use Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### Step 10: Setup Plaid (Mock Mode)

For now, set in `.env`:
```
USE_MOCK_PLAID=true
PLAID_CLIENT_ID=your_id_when_ready
PLAID_SECRET=your_secret_when_ready
PLAID_ENV=sandbox
```

When ready, get credentials from https://dashboard.plaid.com/signup

---

## 🎨 Frontend Setup

### Step 1: Create Frontend Directory

```bash
cd ..
npx create-vite@latest frontend --template react-ts
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install react-router-dom axios @tanstack/react-query styled-components react-hook-form zod @hookform/resolvers

npm install -D @types/styled-components
```

### Step 3: Copy Existing Components

Copy your existing frontend structure:
```bash
cp -r /path/to/old/frontend/src/components ./src/
cp -r /path/to/old/frontend/src/context ./src/
cp -r /path/to/old/frontend/src/pages ./src/
cp -r /path/to/old/frontend/src/layouts ./src/
cp -r /path/to/old/frontend/src/images ./src/
```

### Step 4: Update Frontend Configuration

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 🔒 Security Features Implemented

### ✅ PCI DSS Compliance
1. **No Card Data Storage** - Using Plaid tokenization
2. **Encryption at Rest** - Field-level encryption for PII
3. **Encryption in Transit** - TLS 1.3 enforced
4. **Strong Access Controls** - JWT + 2FA + RBAC
5. **Audit Logging** - All actions logged
6. **Input Validation** - Express-validator on all endpoints
7. **Rate Limiting** - Prevents brute force attacks
8. **Session Management** - Redis-based secure sessions
9. **Password Security** - Bcrypt with 12 rounds
10. **Security Headers** - Helmet.js configured

### ✅ GDPR Compliance
1. **Consent Management** - Granular consent tracking
2. **Right to Access** - Data export endpoint
3. **Right to Erasure** - Account deletion with anonymization
4. **Right to Rectification** - Profile update endpoints
5. **Data Minimization** - Only collect necessary data
6. **Privacy by Design** - Encryption built-in
7. **Breach Notification** - Logging system for detection
8. **Data Retention** - TTL indexes on logs

---

## 🧪 Testing

### Run Tests

```bash
cd backend
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User registration
- [ ] Email verification
- [ ] Login with password
- [ ] Login with 2FA
- [ ] Password reset
- [ ] Profile update
- [ ] Plaid bank linking
- [ ] Transaction sync
- [ ] Budget management
- [ ] Data export (GDPR)
- [ ] Account deletion (GDPR)
- [ ] Rate limiting
- [ ] Unauthorized access attempts

---

## ☁️ AWS Deployment

### Architecture
```
CloudFront → S3 (Frontend)
             ↓
Route 53 → ALB → EC2 (Backend)
             ↓
         ElastiCache (Redis)
             ↓
         MongoDB Atlas
```

### Step-by-Step Deployment

#### 1. Setup MongoDB Atlas
```bash
# Already setup from local development
# Just whitelist AWS IP ranges
```

#### 2. Deploy Backend to EC2

**Launch EC2 Instance:**
```bash
# Amazon Linux 2 or Ubuntu 22.04
# t3.medium or larger
# Security Group: Allow 22, 80, 443, 5000
```

**Connect and Setup:**
```bash
ssh -i your-key.pem ec2-user@your-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Clone repository
git clone your-repo-url
cd secure-banking-app/backend

# Install dependencies
npm install

# Copy production .env
nano .env
# Add production values

# Build TypeScript
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start dist/server.js --name banking-api
pm2 save
pm2 startup
```

#### 3. Setup ElastiCache (Redis)

```bash
# AWS Console → ElastiCache → Create Redis cluster
# Use t3.micro for dev/testing
# Copy endpoint
# Update .env with ElastiCache endpoint
```

#### 4. Deploy Frontend to S3 + CloudFront

```bash
cd frontend

# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront
# Point to S3 bucket
# Add SSL certificate from ACM
# Configure custom domain
```

#### 5. Setup HTTPS with ACM

```bash
# AWS Console → ACM → Request certificate
# Add your domain
# Validate via DNS
# Attach to ALB/CloudFront
```

#### 6. Configure Environment Variables

Use AWS Secrets Manager for production:
```bash
aws secretsmanager create-secret \
  --name banking-app/prod/env \
  --secret-string file://prod.env.json
```

---

## 📊 Monitoring & Logging

### CloudWatch Setup

```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/config.json
```

### Application Logs

Logs are written to:
- `/logs/combined.log` - All logs
- `/logs/error.log` - Errors only
- `/logs/security.log` - Security events

Configure log rotation:
```bash
sudo nano /etc/logrotate.d/banking-app
```

---

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
mongosh

# Check connection string in .env
# Ensure IP is whitelisted in MongoDB Atlas
```

**Redis Connection Failed**
```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

**Encryption Errors**
```bash
# Ensure ENCRYPTION_KEY is exactly 64 hex characters (32 bytes)
node -e "console.log(process.env.ENCRYPTION_KEY.length)"
# Should output: 64
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## 📝 Next Steps

1. ✅ Setup local development environment
2. ✅ Test all features locally
3. ⏳ Add Plaid credentials and test real bank connections
4. ⏳ Write comprehensive tests
5. ⏳ Deploy to AWS
6. ⏳ Setup CI/CD pipeline
7. ⏳ Perform security audit
8. ⏳ Load testing
9. ⏳ Documentation

---

## 🛡️ Security Best Practices

1. **Never commit secrets** - Use .env and .gitignore
2. **Rotate keys regularly** - JWT secrets, encryption keys
3. **Monitor logs** - Check for suspicious activity
4. **Keep dependencies updated** - `npm audit fix`
5. **Use HTTPS everywhere** - No plain HTTP
6. **Validate all inputs** - Never trust user data
7. **Rate limit aggressively** - Prevent abuse
8. **Backup regularly** - Database backups
9. **Test disaster recovery** - Have a plan
10. **Stay compliant** - Regular compliance audits

---

## 📞 Support

For issues or questions:
- Create GitHub issue
- Check logs in `/logs`
- Review audit logs in database

---

## 📄 License

MIT License - See LICENSE file for details