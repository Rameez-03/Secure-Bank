# Security Hardening Audit Log

**Project:** Secure Bank  
**Audit Date:** 2026-04-26  
**Scope:** Full-stack (Express backend + React frontend)  
**Status:** Hardening complete — ready for risk/compliance audit  

---

## 1. Pre-Hardening Baseline

| Area | Finding | Severity |
|------|---------|----------|
| HTTP headers | No Helmet — missing X-Frame-Options, CSP, HSTS, X-Content-Type-Options | HIGH |
| Rate limiting | None on any endpoint — brute force and DoS vulnerable | HIGH |
| JWT secrets | Hardcoded fallback strings (`"your-secret-key"`) used if env vars absent | HIGH |
| JWT algorithm | Not specified — open to algorithm confusion / downgrade | MEDIUM |
| Password policy | Min 6 chars, no complexity requirement | HIGH |
| Bcrypt rounds | 10 (below current OWASP recommendation of 12) | MEDIUM |
| Refresh token storage | Stored in browser `localStorage` — readable by JavaScript/XSS | HIGH |
| Access token storage | Stored in `localStorage` — readable by JavaScript/XSS | HIGH |
| MongoDB injection | No sanitisation of `$` operators in request bodies | HIGH |
| HTTP Parameter Pollution | No HPP protection | MEDIUM |
| CORS | Allowed origins not validated in production path | MEDIUM |
| Body size limit | No limit — potential DoS via large payloads | MEDIUM |
| Input validation | Email not validated server-side; name/amount not length-checked | MEDIUM |
| Duplicate route mount | `/api/transactions` mounted twice in server.js | LOW |
| Error leakage | Stack traces could leak in production 500 responses | MEDIUM |
| npm vulnerabilities (backend) | 13 total (1 critical, 4 high, 5 moderate, 3 low) | HIGH |

---

## 2. Changes Made

### 2.1 New Packages Installed (backend)

| Package | Purpose |
|---------|---------|
| `helmet@^8` | HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) |
| `express-rate-limit@^7` | Per-IP rate limiting |
| `express-mongo-sanitize@^2` | Strip MongoDB operators (`$`, `.`) from request data |
| `hpp@^0.2` | HTTP Parameter Pollution prevention |
| `cookie-parser@^1` | Parse httpOnly cookies for refresh token |

### 2.2 `backend/src/server.js`

- **Helmet** added with Content Security Policy:
  - `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`
  - HSTS enabled in production (`max-age=31536000; includeSubDomains; preload`)
- **CORS** hardened: explicit allowed origins list; `methods` and `allowedHeaders` whitelisted
- **`express-mongo-sanitize()`** strips `$` and `.` from all incoming `req.body`, `req.query`, `req.params`
- **`hpp()`** prevents HTTP Parameter Pollution attacks
- **Body size limit**: `express.json({ limit: '10kb' })` — prevents large-payload DoS
- **Global rate limiter**: 120 requests / 15 min / IP applied to all routes
- **Duplicate route mount** removed (was on line 69)
- **Production error handler**: 500 errors return generic message, no stack trace
- **Startup secret check**: Server exits with code 1 if `JWT_SECRET`, `JWT_REFRESH_SECRET`, or `MONGODB_URI` are missing — no fallback values
- **`trust proxy: 1`** set for correct IP detection behind a reverse proxy

### 2.3 `backend/src/middleware/rateLimiter.js` _(new file)_

| Limiter | Limit | Applied To |
|---------|-------|-----------|
| `globalLimiter` | 120 req / 15 min / IP | All routes (in server.js) |
| `authLimiter` | 10 req / 15 min / IP | `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` |
| `plaidLimiter` | 30 req / 15 min / IP | `/api/plaid/sync` (Plaid API cost protection) |

All rate limiters use RFC 7807-style JSON 429 responses and emit `RateLimit-*` standard headers.

### 2.4 `backend/src/controllers/authController.js`

- **Hardcoded fallback JWT secrets removed** — functions `getJwtSecret()` / `getJwtRefreshSecret()` throw if env vars absent
- **Explicit algorithm**: `{ algorithm: 'HS256' }` on all `jwt.sign()` calls; `{ algorithms: ['HS256'] }` on all `jwt.verify()` calls
- **Bcrypt rounds increased**: 10 → **12** (OWASP 2024 recommendation)
- **Password policy**: minimum **12 characters** + must contain uppercase, lowercase, digit, and special character (`PASSWORD_REGEX`)
- **Email validation**: server-side regex on all register/login paths
- **Timing-safe login**: dummy bcrypt compare on unknown email to prevent user enumeration via timing difference
- **Refresh token**: now issued as **httpOnly, Secure (prod), SameSite cookie** (`rt`) — no longer in response body
- **Cookie options**: `path: '/api/auth'` — refresh cookie only sent to auth routes
- **`/auth/refresh`** reads from `req.cookies.rt` (not request body); verifies user still exists in DB
- **`/auth/logout`** clears the `rt` cookie server-side
- **`getMe`** no longer returns `accessToken` or `plaidCursor` fields

### 2.5 `backend/src/middleware/authMiddleware.js`

- **Hardcoded fallback secret removed** — returns 500 if `JWT_SECRET` not configured
- **Algorithm pinned**: `{ algorithms: ['HS256'] }` on `jwt.verify()`
- **Payload validation**: checks `decoded.userId` exists before setting `req.user`

### 2.6 `backend/src/models/userModel.js`

- **`accessToken` field**: `select: false` — Plaid token excluded from all default queries
- **`email` field**: `lowercase: true`, `trim: true`, regex validator, `maxlength: 254`
- **`name` field**: `trim: true`, `maxlength: 100`
- **`budget` field**: `min: 0` — no negative budget allowed
- **`toJSON` override**: strips `password` and `accessToken` from any serialised User object

### 2.7 `backend/src/routes/authRoutes.js`

- `authLimiter` applied to `POST /register`, `POST /login`, `POST /refresh`

### 2.8 `backend/src/routes/plaidRoutes.js`

- `plaidLimiter` applied to `POST /sync`
- Duplicate `protect` middleware removed (was redundant)

### 2.9 `frontend/src/services/api.jsx`

- **`withCredentials: true`** on the axios instance — required for httpOnly cookie transport
- **In-memory access token**: module-level `_accessToken` variable; exported `setAccessToken()` / `getAccessToken()` functions used by interceptors and context
- **No `localStorage` reads for tokens** — interceptor reads `_accessToken` from memory
- **Refresh call**: `POST /api/auth/refresh` sends no body — relies on cookie
- **On refresh failure**: clears memory token, removes user from localStorage, redirects to `/`
- **`process.env.REACT_APP_API_URL`** bug fixed — was mixing CRA and Vite env syntax; unified to `import.meta.env.VITE_API_URL`

### 2.10 `frontend/src/context/AuthContext.jsx`

- **On app load**: calls `/auth/refresh` instead of reading tokens from localStorage — obtains a fresh access token via httpOnly cookie automatically
- **Removed**: `localStorage.getItem('accessToken')` and `localStorage.getItem('refreshToken')` bootstrap reads
- **Imports `setAccessToken`** from api.jsx to sync in-memory token on load

### 2.11 `frontend/src/context/AuthReducer.js`

- **`LOGIN_SUCCESS` / `REGISTER_SUCCESS`**: calls `setAccessToken()` to store token in memory; removed `localStorage.setItem('accessToken')` and `localStorage.setItem('refreshToken')`
- **`LOGOUT`**: calls `setAccessToken(null)`, removes only `user` from localStorage (no tokens to clear — they're in memory / httpOnly cookie)
- **Removed `refreshToken` from state** — it is never accessible to JavaScript

### 2.12 `frontend/src/pages/Signin.jsx` & `Signup.jsx`

- Removed `localStorage.setItem('accessToken', ...)` and `localStorage.setItem('refreshToken', ...)`
- Destructure only `{ user, accessToken }` from response (no `refreshToken` in body anymore)
- Signup: password validation updated to 12-char minimum + complexity check

### 2.13 `frontend/src/utils/validators.js`

- `isLength` default min updated: `6 → 12`
- `isStrongPassword()` added: mirrors backend `PASSWORD_REGEX`

---

## 3. Token Security Architecture (Post-Hardening)

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                        │
│                                                             │
│  ┌──────────────┐      ┌──────────────────────────────┐   │
│  │ localStorage │      │  JavaScript Memory (React)   │   │
│  │              │      │                              │   │
│  │  user (name, │      │  accessToken (15 min)        │   │
│  │  email, id)  │      │  → never written to disk     │   │
│  │              │      │  → lost on page close        │   │
│  └──────────────┘      └──────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  httpOnly Cookie: rt (7 days)                        │  │
│  │  → NOT readable by JavaScript                       │  │
│  │  → Sent only to /api/auth/* paths                   │  │
│  │  → Secure flag in production                        │  │
│  │  → SameSite: strict (prod) / lax (dev)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**XSS attack surface reduction:**  
- Pre-hardening: XSS can read both access and refresh tokens from localStorage  
- Post-hardening: XSS can read only the user profile object (name, email, id — not sensitive). The refresh token is inaccessible. The access token lives only 15 minutes in memory.

---

## 4. npm Audit Results

| | Before | After |
|-|--------|-------|
| Backend vulnerabilities | 13 (1 critical, 4 high) | **0** |
| Frontend vulnerabilities | 0 | **0** |

---

## 5. Remaining Considerations (Future Work)

These items were identified but are out of scope for this hardening pass:

| Item | Priority | Notes |
|------|----------|-------|
| Plaid `accessToken` encryption at rest | HIGH | Encrypt with `ENCRYPTION_KEY` (already in `.env`) using `crypto.createCipheriv` |
| Token revocation / blacklist | HIGH | Use Redis (already configured in `.env`) to maintain a denylist of invalidated JWTs |
| Account lockout after N failed logins | HIGH | Track `failedLoginAttempts` + `lockUntil` on User model; lock for 15 min after 5 failures |
| HTTPS enforcement | HIGH | Enforce in production via reverse proxy (nginx) or add redirect middleware |
| Email verification on registration | MEDIUM | `ENABLE_EMAIL_VERIFICATION` flag exists in `.env` — needs implementation |
| Two-factor authentication (TOTP) | MEDIUM | `ENABLE_2FA` flag exists in `.env` — needs implementation |
| Audit logging | MEDIUM | Replace `console.log` with structured logger (Winston); log auth events to persistent store |
| CSRF protection | MEDIUM | Add `csurf` or synchronise-token pattern if moving fully to cookie-based auth |
| Password change / reset flow | MEDIUM | No password reset endpoint exists |
| Session management (Redis) | LOW | Redis configured but unused; needed for token blacklist |
| API versioning | LOW | `/api/v1/` prefix recommended before public release |

---

## 6. Environment Variables Required

The following must be set before starting the server (server exits if absent):

```env
JWT_SECRET=<min 32 random bytes, base64>
JWT_REFRESH_SECRET=<min 32 random bytes, base64, different from JWT_SECRET>
MONGODB_URI=<full MongoDB connection string>
```

Recommended additions for production:

```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
ENCRYPTION_KEY=<32-byte hex key for Plaid token encryption>
```

---

## 7. Fix Pass 2 — Vulnerability Remediation (2026-04-26)

Following an objective security review of the hardened codebase, additional vulnerabilities were identified and fixed.

### 7.1 Issues Found and Fixed

| # | File | Vulnerability | Fix Applied |
|---|------|--------------|-------------|
| 1 | `plaidController.js` | `accessToken` field excluded from all queries by `select: false` — `user.accessToken` was `undefined` in every Plaid endpoint, breaking balance, sync, and unlink | Added `.select('+accessToken')` to every `User.findById()` that requires the Plaid token |
| 2 | `plaidController.js` | Plaid access token stored in plaintext in MongoDB | `exchangePublicToken` now calls `encrypt(rawToken)` before `findByIdAndUpdate`; all read paths call `safeDecrypt(user.accessToken)` |
| 3 | `plaidController.js` | `getAuth` and `getPlaidTransactions` accepted `access_token` from the request body — any valid Plaid token could be passed by the caller | Removed `access_token` from request body on both endpoints; they now look up the authenticated user's stored token |
| 4 | `plaidController.js` | All Plaid error responses returned `error.response?.data` (full Plaid error objects with internal codes and messages) to the client in all environments | Added `isProd` check — full error detail is logged server-side and only returned to client in development; production responses are generic |
| 5 | `authController.js` | Dummy bcrypt hash `"$2b$12$invalidhashfortimingprotectionXXXXXXXXXXXXX"` was 52 chars — bcrypt requires 60 chars and detects invalid format, returning immediately without running the hash comparison, defeating timing-attack protection | Replaced with `DUMMY_HASH = bcrypt.hashSync("__timing_dummy__", BCRYPT_ROUNDS)` computed once at module load; bcrypt now runs a full 12-round comparison on the unknown-email path |
| 6 | `userRoutes.js` | `PUT /:id/budget` had no input validation — non-numeric, negative, or extreme values passed directly to MongoDB | Added type check (`Number.isFinite`), negative check, upper bound (10,000,000), and `runValidators: true` |
| 7 | `userRoutes.js` | `PUT /:id` had no input validation — arbitrary name/email values passed to `findByIdAndUpdate` without sanitisation; duplicate email produced an unhandled 500 | Added name length validation (1–100), server-side email regex validation, normalisation (`trim/toLowerCase`), `runValidators: true`, and explicit `code 11000` duplicate-email handler |
| 8 | `userRoutes.js` | `GET /:id` used `.populate("transactions")` — unbounded result set, potential DoS via accounts with thousands of transactions | Removed `.populate("transactions")`; transactions are fetched via the dedicated `/api/transactions` endpoint with its own pagination |
| 9 | `server.js` | `app.set("trust proxy", 1)` was unconditional — in development/local environments this allows `X-Forwarded-For` spoofing, defeating IP-based rate limiting | Made conditional: `if (isProd) app.set("trust proxy", 1)` |
| 10 | `.env.example` | Key name `JWT_ACCESS_SECRET` did not match the variable name used in code (`JWT_SECRET`) — new developers following the example would have a broken server | Renamed to `JWT_SECRET` to match `authController.js` and `authMiddleware.js` |

### 7.2 New Files

| File | Purpose |
|------|---------|
| `backend/src/utils/encrypt.js` | AES-256-GCM encrypt/decrypt utilities with migration support (`safeDecrypt` handles both encrypted and legacy plaintext tokens); format: `iv_hex:authTag_hex:ciphertext_hex` |

### 7.3 Remaining Considerations (Updated)

The following items from §5 are now addressed:

- ✅ Plaid `accessToken` encryption at rest — implemented via `encrypt.js` + AES-256-GCM

The following items remain out of scope:

| Item | Priority | Notes |
|------|----------|-------|
| Token revocation / blacklist | HIGH | Use Redis (configured in `.env`) to maintain a denylist of invalidated JWTs |
| Account lockout after N failed logins | HIGH | Track `failedLoginAttempts` + `lockUntil` on User model; lock for 15 min after 5 failures |
| HTTPS enforcement | HIGH | Enforce in production via reverse proxy (nginx) or add redirect middleware |
| Email verification on registration | MEDIUM | `ENABLE_EMAIL_VERIFICATION` flag exists in `.env` — needs implementation |
| Two-factor authentication (TOTP) | MEDIUM | `ENABLE_2FA` flag exists in `.env` — needs implementation |
| Audit logging | MEDIUM | Replace `console.log` with structured logger (Winston); log auth events to persistent store |
| CSRF protection | MEDIUM | Add `csurf` or synchronise-token pattern if moving fully to cookie-based auth |
| Password change / reset flow | MEDIUM | No password reset endpoint exists |
| Session management (Redis) | LOW | Redis configured but unused; needed for token blacklist |
| API versioning | LOW | `/api/v1/` prefix recommended before public release |

---

*Fix Pass 2 — 2026-04-26*

---

## 8. Fix Pass 3 — Deep Security Review (2026-04-26)

A second full-codebase review was performed covering all controllers, models, routes, and frontend services not examined in previous passes.

---

### 8.1 Vulnerability Summary

| # | Severity | Area | Description |
|---|----------|------|-------------|
| 1 | HIGH | Transaction input | No validation on `amount` — NaN/Infinity stored silently, corrupting health score maths |
| 2 | HIGH | Transaction input | No `maxlength` on `description` or `category` — oversized strings could hit MongoDB's 16 MB document limit |
| 3 | HIGH | Transaction update | `updateTransaction` had no `isManual` check — users could edit Plaid-synced bank transactions to manipulate health scores |
| 4 | MEDIUM | Transaction queries | `getTransactions` had no limit or pagination — loading all records into memory on every request |
| 5 | MEDIUM | Health score query | `getHealthScore` loaded all transactions with no limit — same memory pressure as above |
| 6 | MEDIUM | ObjectId handling | `error.kind === 'ObjectId'` is deprecated in Mongoose 7+ — invalid IDs fell through to the generic 500 handler |
| 7 | MEDIUM | Account deletion | No endpoint to delete a user account — violates GDPR right to erasure; user data persisted permanently |
| 8 | MEDIUM | User API responses | `plaidCursor` and `plaidItemId` returned in every user object response — unnecessary data exposure |
| 9 | LOW | Frontend dead code | `plaidAPI.getAuth()` and `plaidAPI.getTransactions()` still passed `access_token` as a parameter — backend now ignores it but it misleads future developers |
| 10 | LOW | Settings password check | Frontend password-change form validated minimum length as 6 characters instead of 12, inconsistent with the backend policy |

---

### 8.2 Fixes Applied

#### 8.2.1 `backend/src/models/transactionModel.js`

| Field | Change |
|-------|--------|
| `description` | Added `maxlength: 500` |
| `category` | Added `maxlength: 100` |
| `amount` | Added `min: -1,000,000,000` and `max: 1,000,000,000` |
| `description`, `category` | Added `trim: true` |

---

#### 8.2.2 `backend/src/controllers/transactionController.js`

**`addTransaction`**
- `amount`: `Number.isFinite()` check, range check (±1 billion), rejects NaN / Infinity / strings
- `description`: non-empty string check, 500-char max
- `category`: non-empty string check, 100-char max
- `date`: validated via `new Date()` parse + year range 1970–2100; defaults to now if omitted

**`updateTransaction`**
- Same input validation as `addTransaction` applied to all provided fields
- Added `isManual` guard — returns `403 "Bank-imported transactions cannot be edited"` if `isManual === false`
- Unchanged fields are not overwritten (only provided fields applied)

**`getTransaction` / `updateTransaction` / `deleteTransaction`**
- Replaced deprecated `error.kind === 'ObjectId'` with `mongoose.isValidObjectId(req.params.id)` guard at the top of each handler — invalid IDs now return clean 404 immediately

**`getTransactions`**
- Added pagination: `?page=1&limit=500` query params
- Default limit: 500 | Maximum limit: 500 (prevents unbounded memory load)
- Response now includes `pagination: { page, limit, total, pages }` metadata
- Uses `Promise.all` for count + data query in parallel

---

#### 8.2.3 `backend/src/controllers/healthScoreController.js`

- `Transaction.find({ userId })` now has `.sort({ date: -1 }).limit(1000)` — caps memory usage; 1,000 most-recent transactions is sufficient for all score calculations

---

#### 8.2.4 `backend/src/models/userModel.js`

- `toJSON()` method extended to also strip `plaidCursor` and `plaidItemId` from all serialised user objects — these internal Plaid fields have no value to any client

---

#### 8.2.5 `backend/src/routes/userRoutes.js`

**New route: `DELETE /api/users/:id`**

Full account deletion flow (authenticated, ownership-checked):
1. Verifies the requesting user owns the account
2. Fetches user with `+accessToken` selected
3. Attempts best-effort Plaid `itemRemove` to revoke bank access (non-fatal if Plaid is unreachable)
4. `Transaction.deleteMany({ userId })` — removes all transaction records
5. `User.findByIdAndDelete` — removes the user document
6. Clears the `rt` httpOnly cookie
7. Returns `200 { success: true, message: "Account deleted successfully" }`

---

#### 8.2.6 `frontend/src/services/api.jsx`

| Change | Detail |
|--------|--------|
| `plaidAPI.getAuth()` | Removed `accessToken` parameter — backend uses stored token only |
| `plaidAPI.getTransactions()` | Removed `accessToken` parameter — now takes `(startDate, endDate)` only |
| `userAPI.deleteAccount(userId)` | New method: `DELETE /users/:id` |

---

#### 8.2.7 `frontend/src/pages/Settings.jsx`

- Added **Danger Zone** section with a "Delete Account" button
  - Double-confirmation via `window.confirm` before proceeding
  - Calls `userAPI.deleteAccount`, then clears in-memory token and dispatches `LOGOUT`
- Fixed password-change minimum length check: `6` → `12` characters (matches backend `PASSWORD_REGEX`)

---

### 8.3 Remaining Open Items

The following items remain unresolved across all three passes. They require infrastructure changes or new endpoints beyond the scope of the hardening sprint.

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 1 | JWT access token blocklist on logout | HIGH | 15-minute window where a stolen token stays valid after logout. Requires Redis denylist |
| 2 | Account lockout after failed logins | HIGH | Track `failedLoginAttempts` + `lockUntil` on User model; 15-min lock after 5 failures |
| 3 | HTTPS enforcement | HIGH | Enforce via nginx reverse proxy in production |
| 4 | Password change / reset endpoint | HIGH | No `POST /auth/change-password` or forgot-password flow exists |
| 5 | Email verification on registration | MEDIUM | `ENABLE_EMAIL_VERIFICATION` flag in `.env` — needs implementation |
| 6 | Two-factor authentication (TOTP) | MEDIUM | `ENABLE_2FA` flag in `.env` — needs implementation |
| 7 | Structured audit logging | MEDIUM | Replace `console.log` with Winston; persist auth events (login, logout, failed attempts) |
| 8 | CSRF tokens | MEDIUM | `SameSite: strict` cookie mitigates most risk, but formal CSRF tokens provide belt-and-suspenders |
| 9 | Redis session / blacklist | LOW | Redis is configured in `.env` but unused |
| 10 | API versioning (`/api/v1/`) | LOW | Recommended before public release |

---

*Fix Pass 3 — 2026-04-26*
