# Compliance Audit Report — Secure Bank

**Classification:** Internal — Restricted  
**Project:** Secure Bank (full-stack personal finance application)  
**Audit Type:** Self-assessment — regulatory and application security compliance  
**Assessment Date:** 2026-04-26  
**Auditor:** Rameez (developer / data controller)  
**Report Status:** Active — gaps documented, remediation in progress

---

## Document Control

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-04-26 | Initial compliance audit — UK GDPR, OWASP Top 10, gap register |
| 1.1 | 2026-04-26 | Compliance implementation sprint: C-01 Privacy Notice built; C-02/C-04 data export implemented; C-03 restriction toggle implemented; C-06 health score disclosed; C-07 retention policy documented and lastLoginAt tracking added; C-11 DPIA completed; C-12 cookie notice in Privacy Policy; C-13 age verification on signup. New documents: PRIVACY_POLICY.md, DATA_RETENTION_POLICY.md, BREACH_REGISTER.md, DPIA.md, DPA_RECORDS.md |

---

## 1. Scope & Methodology

### 1.1 Audit Scope

This report assesses the Secure Bank application's compliance with applicable data protection law and application security standards. It covers:

| Area | Description |
|------|-------------|
| UK GDPR / DPA 2018 | Data protection obligations as a UK data controller processing personal data |
| PECR 2003 | Privacy and Electronic Communications Regulations — cookie and electronic communications obligations |
| OWASP Top 10 (2021) | Application security compliance overlay |
| ICO Registration | Requirement to register with the Information Commissioner's Office |

### 1.2 Out of Scope

| Item | Reason |
|------|--------|
| EU GDPR | UK GDPR post-Brexit applies; EU GDPR would additionally apply only if serving EU data subjects |
| PCI DSS | **Does not apply.** The application does not store, process, or transmit cardholder data. Plaid handles bank-level compliance. The application is a read-only consumer of Plaid's API |
| FCA Regulation | Does not apply to a non-commercial portfolio application with no live financial transactions |
| CIS Benchmarks | Infrastructure hardening — deferred to deployment phase |

### 1.3 Methodology

- **Document review:** Source code, data models, API routes, security documentation (SECURITY.md)
- **Self-assessment:** Each control assessed as Compliant / Partial / Non-Compliant / Not Applicable
- **Gap identification:** Each non-compliant item logged in the Compliance Gap Register (§13) with a remediation action

### 1.4 Role Classification

| Role | Entity | Description |
|------|--------|-------------|
| **Data Controller** | Secure Bank / Rameez | Determines the purpose and means of processing personal data |
| **Data Processor** | Plaid Inc. | Processes bank account data on behalf of the controller |
| **Data Subjects** | App users | Individuals whose personal data is processed |
| **Supervisory Authority** | ICO (UK) | Information Commissioner's Office — UK data protection regulator |

---

## 2. Applicable Regulations & Standards

### 2.1 UK GDPR & Data Protection Act 2018

The UK General Data Protection Regulation (retained from EU GDPR, as amended by the Data Protection Act 2018 and subsequent UK legislation) applies because:

- The data controller (developer) is based in the United Kingdom
- The application processes personal data of UK-based individuals
- Personal data processed includes: names, email addresses, and financial transaction records — all classified as personal data under Article 4(1) UK GDPR

**Relevant articles:**

| Article | Subject | Status |
|---------|---------|--------|
| 5 | Principles of processing (lawfulness, fairness, transparency, minimisation, accuracy, storage limitation, integrity) | ⚠️ Partially met |
| 6 | Lawful basis for processing | ⚠️ Not formally documented |
| 13–14 | Transparency — information to be provided to data subjects | ❌ Not implemented |
| 15 | Right of access | ⚠️ Partial (UI access only, no formal export) |
| 16 | Right to rectification | ✅ Met — name and email editable in Settings |
| 17 | Right to erasure | ✅ Met — delete account implemented |
| 18 | Right to restriction of processing | ❌ Not implemented |
| 20 | Right to data portability | ❌ Not implemented |
| 21 | Right to object | ❌ Not documented |
| 28 | Processor agreements (Plaid) | ⚠️ Plaid's DPA covers this; not formally reviewed |
| 30 | Records of processing activities | ✅ Met — documented below (§4) |
| 32 | Security of processing | ✅ Met — documented in SECURITY.md |
| 33 | Breach notification to supervisory authority | ❌ No documented procedure |
| 34 | Communication of breach to data subjects | ❌ No documented procedure |
| 35 | Data Protection Impact Assessment | ❌ Not performed |

### 2.2 PECR 2003

The Privacy and Electronic Communications Regulations 2003 (PECR) governs the use of cookies and electronic marketing communications.

**Cookie usage in this application:**

| Cookie | Name | Type | Purpose | Consent Required |
|--------|------|------|---------|-----------------|
| Refresh token | `rt` | Strictly necessary — authentication | Maintains user session across browser restarts; application cannot function without it | **No** — strictly necessary cookies are exempt from PECR consent requirements |

No analytics, advertising, or tracking cookies are set. No third-party pixels or SDKs are loaded. PECR consent requirements do not apply to this application in its current form.

### 2.3 ICO Registration (DPA 2018, Part 4)

Under Section 108 of the Data Protection Act 2018, most organisations that process personal data must register with the ICO as a data controller and pay an annual registration fee.

**Current status: ❌ Not registered** — see C-09 in the Gap Register.

---

## 3. Data Mapping

Mapping of all personal data flows through the application, from collection point through to deletion. This satisfies the spirit of Article 30 (Records of Processing Activities).

### 3.1 Data Collected at Each Entry Point

| Entry Point | Data Collected | Required / Optional |
|-------------|---------------|---------------------|
| Registration (`POST /auth/register`) | Full name, email address, password (hashed immediately, plaintext never stored) | All required |
| Login (`POST /auth/login`) | Email address, password (compared to hash, plaintext discarded) | All required |
| Settings — Profile update (`PUT /users/:id`) | Full name, email address | Optional update |
| Settings — Budget update (`PUT /users/:id/budget`) | Monthly budget amount (£) | Optional |
| Transaction — Manual entry (`POST /transactions`) | Amount, description, category, date | All required |
| Bank link — Plaid (`POST /plaid/exchange_public_token`) | Plaid access token (encrypted at rest), Plaid item ID | Generated by Plaid integration |
| Bank sync (`POST /plaid/sync`) | Financial transaction records from linked bank account | Imported from Plaid |
| Password reset (`POST /auth/forgot-password`) | Email address | Required |

### 3.2 Records of Processing Activities (ROPA)

Satisfies Article 30 UK GDPR.

| # | Processing Activity | Personal Data Categories | Data Subjects | Purpose | Lawful Basis | Retention Period | Third-Party Recipients |
|---|--------------------|-----------------------|---------------|---------|-------------|-----------------|----------------------|
| 1 | User account management | Name, email, hashed password, created/updated timestamps | Registered users | Create and maintain user accounts; enable authentication | Article 6(1)(b) — performance of contract | Until account deletion | None |
| 2 | Authentication & session management | Email, JWT access token (memory only), refresh token (httpOnly cookie) | Registered users | Verify identity; maintain authenticated sessions | Article 6(1)(b) — performance of contract | Access token: 15 min (in-memory); Refresh token: 7 days (cookie) | None |
| 3 | Personal finance tracking | Financial transaction records (amount, description, category, date, pending status) | Registered users | Enable users to track their personal income and expenditure | Article 6(1)(b) — performance of contract | Until account deletion or manual deletion by user | None |
| 4 | Bank account integration | Encrypted Plaid access token, Plaid item ID, imported transaction records | Registered users (who choose to link a bank) | Import real bank transactions automatically via Plaid | Article 6(1)(a) — consent (explicit opt-in to bank linking) | Plaid token: until bank is unlinked or account deleted; Transactions: until account deletion | Plaid Inc. (processor) — receives user's Plaid public token during exchange |
| 5 | Monthly budget tracking | Budget amount (£) | Registered users | Enable spending vs budget comparison | Article 6(1)(b) — performance of contract | Until account deletion | None |
| 6 | Password recovery | Email address, SHA-256 hashed reset token | Registered users | Enable account recovery without admin intervention | Article 6(1)(b) — performance of contract | Reset token: 1 hour (auto-expiry via `resetPasswordExpires` field) | SMTP provider (if configured) — receives destination email address |
| 7 | Financial health score calculation | Aggregated transaction records | Registered users | Provide personalised financial insights | Article 6(1)(b) — performance of contract | Calculated on request; no additional storage | None |

### 3.3 Data Flows Diagram

```
USER BROWSER
    │
    ├─── Registration / Login ──────────────────────────────►  EXPRESS API
    │         (name, email, password)                               │
    │                                                               ├── bcrypt hash ──── MongoDB
    │                                                               │   (name, email,     (Users collection)
    │                                                               │    hash, budget,
    ├─── Session (httpOnly cookie rt) ──────────────────────►       │    timestamps)
    │         (refresh token — JS-inaccessible)                     │
    │                                                               ├── Transactions ─── MongoDB
    ├─── Manual transactions ───────────────────────────────►       │   (userId, amount,  (Transactions collection)
    │         (amount, desc, category, date)                        │    desc, category,
    │                                                               │    date, isManual)
    ├─── Bank link (Plaid Link widget) ─────────────────────►       │
    │         (Plaid public_token)                                  ├── AES-256-GCM ──── MongoDB
    │                                                               │   encrypt           (Users.accessToken)
    │                                                               │
    └─── Password reset (email link) ───────────────────────►       ├── SHA-256 hash ─── MongoDB
                                                                    │   (reset token)     (Users.resetPasswordToken)
                                                                    │
                                                                    └── Plaid API ──────► Plaid Inc.
                                                                        (encrypted token    (bank data processor)
                                                                         decrypted in-
                                                                         memory only)
```

---

## 4. Lawful Basis Assessment — Article 6 UK GDPR

A lawful basis must be identified before processing any personal data. The most appropriate basis for each processing activity is assessed below.

| Processing Activity | Basis Applied | Article 6 Reference | Justification | Assessment |
|--------------------|--------------|---------------------|---------------|------------|
| Account registration and management | **Performance of a contract** | 6(1)(b) | User explicitly registers to use the service; name and email are necessary to identify the user and communicate with them | ✅ Valid |
| Authentication | **Performance of a contract** | 6(1)(b) | Session management is necessary to deliver the service the user signed up for | ✅ Valid |
| Transaction storage (manual) | **Performance of a contract** | 6(1)(b) | The core purpose of the application; user enters data to use the service | ✅ Valid |
| Bank account linking (Plaid) | **Consent** | 6(1)(a) | User actively chooses to link a bank account via the Plaid Link flow — this is clearly opt-in and optional | ✅ Valid — but consent must be documented and withdrawable |
| Password recovery | **Legitimate interests** | 6(1)(f) | Sending a reset email is in the user's direct interest and expected; no overriding prejudice to the data subject | ✅ Valid |
| Financial health score | **Performance of a contract** | 6(1)(b) | Derived from user's own transaction data to deliver a core feature | ✅ Valid |

**Gap:** The lawful basis for each processing activity has not been communicated to users (no Privacy Notice exists). The basis is valid but undisclosed — a transparency violation under Articles 13–14. See C-01.

---

## 5. Data Subject Rights Assessment — Articles 12–22 UK GDPR

Data subjects must be able to exercise their rights without undue delay. Responses are required within **one calendar month** (Article 12(3)).

| Right | Article | Mechanism Available | Status | Gap Reference |
|-------|---------|--------------------|---------| --------------|
| Right to be informed | 13–14 | No Privacy Notice exists | ❌ Non-compliant | C-01 |
| Right of access | 15 | Users can view their own data in the UI; no formal data export or subject access request (SAR) process | ⚠️ Partial | C-02 |
| Right to rectification | 16 | Name and email editable in Settings → Profile; budget editable | ✅ Met | — |
| Right to erasure | 17 | Delete Account in Settings → Danger Zone; removes user document, all transactions, and revokes Plaid bank access | ✅ Met | — |
| Right to restriction of processing | 18 | No mechanism to restrict processing while keeping the account active | ❌ Not implemented | C-03 |
| Right to data portability | 20 | No data export feature (JSON/CSV of transactions and profile) | ❌ Not implemented | C-04 |
| Right to object | 21 | No mechanism to object to processing; no documented response process | ❌ Not documented | C-05 |
| Rights re. automated decision-making | 22 | Financial health score is automated but does not constitute a legally significant or similarly significant decision — Article 22 does not apply; however the scoring logic should be disclosed | ⚠️ Disclosure gap | C-06 |

---

## 6. Privacy & Transparency Assessment — Articles 13–14 UK GDPR

Article 13 requires that data subjects are informed at the point of data collection (registration) about:

| Required Information | Article 13 Reference | Status |
|---------------------|---------------------|--------|
| Identity and contact details of the controller | 13(1)(a) | ❌ Not disclosed |
| Purpose and lawful basis of processing | 13(1)(c) | ❌ Not disclosed |
| Legitimate interests (where basis is Art. 6(1)(f)) | 13(1)(d) | ❌ Not disclosed |
| Recipients or categories of recipients (Plaid) | 13(1)(e) | ❌ Not disclosed |
| Retention periods | 13(2)(a) | ❌ Not disclosed |
| Rights of the data subject (access, erasure, portability, etc.) | 13(2)(b) | ❌ Not disclosed |
| Right to withdraw consent (where basis is consent — bank linking) | 13(2)(c) | ❌ Not disclosed |
| Right to lodge a complaint with the ICO | 13(2)(d) | ❌ Not disclosed |
| Whether provision of data is a contractual requirement | 13(2)(e) | ❌ Not disclosed |

**Assessment: ❌ Fully non-compliant.** No Privacy Notice or Privacy Policy exists. This is required to be presented to users at registration. See C-01.

---

## 7. Data Minimisation & Retention — Article 5 UK GDPR

Article 5(1)(c) requires that personal data is **adequate, relevant and limited to what is necessary** (data minimisation).  
Article 5(1)(e) requires that data is **kept no longer than necessary** (storage limitation).

### 7.1 Data Minimisation Assessment

| Data Field | Necessary for Purpose | Assessment |
|-----------|----------------------|------------|
| `name` | Yes — displayed in UI, used in avatar initials | ✅ |
| `email` | Yes — authentication, password recovery | ✅ |
| `password` (hashed) | Yes — authentication | ✅ |
| `budget` | Yes — budget tracking feature | ✅ |
| `accessToken` (encrypted Plaid token) | Yes — required for Plaid API calls | ✅ |
| `plaidItemId` | Yes — identifies the bank link in Plaid | ✅ (stripped from API responses via `toJSON()`) |
| `plaidCursor` | Yes — required for Plaid transaction sync pagination | ✅ (stripped from API responses via `toJSON()`) |
| `resetPasswordToken` (hashed) | Yes — password recovery, 1-hr expiry | ✅ |
| `resetPasswordExpires` | Yes — enforces token expiry | ✅ |
| `transactions[].plaidTransactionId` | Yes — prevents duplicate imports | ✅ |
| IP addresses (in rate limiter) | Processed transiently for rate limiting; not stored | ✅ |
| Request logs | Not currently logged | ✅ (no excess retention — but also gap R-03 in SECURITY.md) |

**Assessment: ✅ Data minimisation is well-managed.** No unnecessary personal data fields exist in the schema.

### 7.2 Retention Schedule

| Data Category | Current Retention | Policy Required | Assessment |
|--------------|------------------|----------------|------------|
| User account data (name, email, password) | Until account deletion (user-triggered) | Yes | ✅ Functional mechanism exists; policy not formally documented |
| Transaction records | Until account deletion | Yes | ✅ Deleted with account; no documented maximum retention period |
| Plaid access token | Until bank unlink or account deletion | Yes | ✅ |
| Reset password token | 1 hour (hard expiry in DB) | — | ✅ Automated |
| JWT access token | 15 minutes (in-memory) | — | ✅ Automated |
| Refresh token cookie | 7 days | — | ✅ Automated |
| Inactive account data | No policy | Yes — formal policy required | ⚠️ Gap |

**Gap:** No formal data retention policy document exists. There is no mechanism to flag or delete data from long-inactive accounts. See C-07.

---

## 8. Security Measures Assessment — Article 32 UK GDPR

Article 32 requires "appropriate technical and organisational measures" to ensure security appropriate to the risk. Full technical detail is in SECURITY.md. This section provides the compliance-level view.

| Measure | Article 32 Consideration | Implementation | Status |
|---------|--------------------------|----------------|--------|
| Pseudonymisation | Reducing identifiability where possible | Plaid tokens stored as AES-256-GCM ciphertext; passwords as bcrypt hashes — originals not recoverable from stored data | ✅ |
| Encryption | Protecting data confidentiality | Plaid tokens: AES-256-GCM at rest; passwords: bcrypt 12 rounds; HTTPS: not yet enforced (infrastructure gap) | ⚠️ |
| Ongoing confidentiality, integrity, availability | Systems resilience | Rate limiting, input validation, pagination limits, body size limits in place | ✅ |
| Regular testing and evaluation | Security review process | Four security review passes documented in SECURITY.md; STRIDE threat model applied | ✅ |
| Access control | Limiting access to personal data | JWT-based authentication; all queries scoped to `req.user.userId`; no admin access panel | ✅ |
| Breach notification capability | Article 33 readiness | No documented breach detection or notification procedure | ❌ |

**Cross-reference:** SECURITY.md — full technical audit, threat model, fix passes, and residual risk register.

---

## 9. Third-Party Processor Assessment — Article 28 UK GDPR

Where a controller uses a processor, Article 28 requires a Data Processing Agreement (DPA) to be in place. The processor must provide sufficient guarantees of appropriate technical and organisational measures.

### 9.1 Plaid Inc.

| Item | Detail |
|------|--------|
| **Role** | Data Processor — processes bank account data on behalf of the controller |
| **Data shared** | Plaid public token (exchanged for access token); bank transaction records returned to the application |
| **User opt-in** | Yes — users explicitly connect their bank via the Plaid Link widget |
| **Plaid's compliance certifications** | SOC 2 Type II; PCI DSS Level 1 (handles card data Plaid-side); GDPR-compliant DPA available |
| **DPA with Plaid** | Plaid's standard Data Processing Addendum is available and should be formally accepted by the controller |
| **Data subject withdrawal** | Supported — unlink bank account removes the access token and calls Plaid `itemRemove` |

**Assessment:** Plaid is an appropriate processor with strong compliance certifications. The application correctly encrypts the Plaid access token at rest and calls `itemRemove` on account deletion and bank unlinking.

**Gap:** The controller (developer) has not formally reviewed or accepted Plaid's Data Processing Addendum. This must be completed before serving real users. See C-08.

### 9.2 SMTP Email Provider (password reset)

| Item | Detail |
|------|--------|
| **Role** | Sub-processor — transmits password reset emails on behalf of the controller |
| **Data shared** | Destination email address and reset URL only |
| **DPA required** | Yes — if using a commercial provider (e.g. SendGrid, Mailgun, AWS SES), their DPA must be reviewed and accepted |
| **Status** | SMTP provider not yet selected; dev mode uses console fallback — no email transmitted |

**Assessment:** Not yet applicable (dev mode). Must be addressed before production. See C-08.

---

## 10. Breach Response Readiness — Articles 33–34 UK GDPR

### 10.1 Legal Obligations

| Obligation | Article | Requirement |
|------------|---------|-------------|
| Notify the ICO | 33 | Within **72 hours** of becoming aware of a personal data breach that risks individuals' rights and freedoms |
| Notify affected data subjects | 34 | Without undue delay when the breach is likely to result in a high risk to individuals |
| Document all breaches | 33(5) | Maintain a register of all breaches, including those not reported to the ICO |

### 10.2 Current Readiness

| Capability | Status |
|-----------|--------|
| Breach detection (monitoring / alerting) | ❌ No structured logging; no anomaly detection |
| Breach assessment procedure (risk classification) | ❌ No documented procedure |
| ICO notification procedure (72-hour window) | ❌ No documented procedure; ICO contact not on file |
| Data subject notification procedure | ❌ No documented procedure; no email communication capability beyond password reset |
| Breach register | ❌ No register maintained |

**ICO Reporting Portal:** https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/

**Assessment: ❌ Non-compliant.** No breach response capability exists. See C-10.

---

## 11. OWASP Top 10 Compliance Assessment (2021)

The OWASP Top 10 provides a broadly accepted standard of the most critical application security risks. Compliance status is assessed against the current codebase (post all security fix passes).

| # | Risk Category | Key Controls Assessed | Status | Notes |
|---|--------------|----------------------|--------|-------|
| A01 | Broken Access Control | IDOR protection (userId scoping); CORS whitelist; ownership checks on all user routes | ✅ **Compliant** | All queries scoped to `req.user.userId`; no admin privilege escalation surface |
| A02 | Cryptographic Failures | Passwords (bcrypt 12 rounds); Plaid tokens (AES-256-GCM); tokens not in localStorage; HTTPS | ⚠️ **Partial** | Cryptography strong; HTTPS not yet enforced at application layer — depends on deployment |
| A03 | Injection | MongoDB operator sanitisation; input validation; ODM parameterised queries | ✅ **Compliant** | `express-mongo-sanitize`; `hpp`; server-side validation on all endpoints |
| A04 | Insecure Design | Threat model documented; rate limiting; business logic guards; security by design | ✅ **Compliant** | STRIDE threat model; `isManual` guard; timing-safe login; enumeration prevention |
| A05 | Security Misconfiguration | HTTP headers (Helmet); CORS; error messages; trust proxy; no defaults left exposed | ✅ **Compliant** | Helmet CSP/HSTS; generic 500 in production; `trust proxy` conditional on `NODE_ENV` |
| A06 | Vulnerable & Outdated Components | npm audit (0 vulnerabilities post-hardening); dependency management | ⚠️ **Partial** | 0 vulnerabilities at audit date; no automated monitoring for future advisories |
| A07 | Identification & Authentication Failures | Password policy; brute force protection; MFA; session management; token storage | ⚠️ **Partial** | Strong password policy; httpOnly cookies; no MFA; no account lockout after N failures |
| A08 | Software & Data Integrity Failures | Package integrity (`package-lock.json`); no unsafe deserialisation; no untrusted update channels | ✅ **Compliant** | No custom deserialisation; lockfile present |
| A09 | Security Logging & Monitoring Failures | Persistent security event logging; failed login alerts; anomaly detection | ✅ **Compliant** | Winston structured JSON logger — auth events emit persistent logs with userId, IP, and event type |
| A10 | Server-Side Request Forgery (SSRF) | No user-controlled URLs fetched server-side | ✅ **N/A — Compliant** | Application does not perform any server-side URL fetches based on user input |

**Summary:** 6 Compliant / 3 Partial / 1 Non-compliant  
Cross-reference: SECURITY.md for full technical remediation detail on each control.

---

## 12. Data Protection Impact Assessment — Article 35 UK GDPR

A DPIA is required before processing that is **likely to result in a high risk** to individuals' rights and freedoms. The ICO recommends a DPIA when processing financial data, especially at scale or when using new technologies.

### 12.1 Screening Assessment

| Criterion | Applies? | Notes |
|-----------|---------|-------|
| Large-scale processing of financial data | Potentially — depends on user growth | Transaction data is inherently financial and sensitive |
| Innovative technology (bank aggregation via API) | Yes | Plaid integration is a relatively novel technology in consumer finance |
| Automated decision-making with significant effects | No | Health score is informational, not a legal or financial decision |
| Processing data of vulnerable individuals | Unknown | No age gate or vulnerability screening exists |
| Data matching or combining datasets | No | Only the user's own data is combined |

**Assessment:** A DPIA is recommended before launch given the financial data classification and Plaid integration. See C-11.

---

## 13. Compliance Gap Register

All compliance deficiencies identified across all assessment areas, consolidated into a single authoritative register. Items are ordered by priority.

| ID | Requirement | Regulation | Article | Current State | Priority | Risk if Unaddressed |
|----|-------------|-----------|---------|--------------|----------|---------------------|
| C-01 | Privacy Notice / Privacy Policy | UK GDPR | 13–14 | ✅ **Resolved v1.1** — Privacy Policy page built at `/privacy-policy`; linked from signup form and Settings; covers all Article 13 required disclosures | **Critical** | ✅ Closed |
| C-02 | Right of access / data export | UK GDPR | 15, 20 | ✅ **Resolved v1.1** — `GET /api/users/:id/export` returns full JSON data export; "Export My Data" button in Settings → Privacy & Data | **High** | ✅ Closed |
| C-03 | Right to restriction of processing | UK GDPR | 18 | ✅ **Resolved v1.1** — `POST /api/users/:id/restrict` toggles `isRestricted` flag; Settings → Privacy & Data UI; guards on transaction write ops and Plaid sync | **Medium** | ✅ Closed |
| C-04 | Right to data portability | UK GDPR | 20 | ✅ **Resolved v1.1** — Satisfied by same export endpoint as C-02 (machine-readable JSON) | **High** | ✅ Closed |
| C-05 | Right to object | UK GDPR | 21 | ⚠️ **Partial** — Contact email `privacy@securebank.app` listed in Privacy Policy; internal response process not yet formally documented | **Medium** | ⚠️ Needs contact email set up |
| C-06 | Disclosure of automated decision logic | UK GDPR | 22 | ✅ **Resolved v1.1** — Health score methodology disclosed on Analytics page and in Privacy Policy §7 | **Low** | ✅ Closed |
| C-07 | Data retention policy | UK GDPR | 5(1)(e) | ✅ **Resolved v1.1** — `DATA_RETENTION_POLICY.md` created; `lastLoginAt` tracking implemented; automated inactive account deletion pending (scheduled job not yet built) | **Medium** | ⚠️ Policy documented; automation pending |
| C-08 | Data Processing Agreements (Plaid + SMTP) | UK GDPR | 28 | ⚠️ **Pending** — `DPA_RECORDS.md` created with processor register; Plaid DPA not yet formally accepted; SMTP provider not yet selected | **High** | ❌ Needs admin action |
| C-09 | ICO Registration | DPA 2018 | Part 4, s.108 | ❌ **Pending** — Not registered; requires admin action at ico.org.uk | **High** | ❌ Needs admin action |
| C-10 | Breach response procedure | UK GDPR | 33–34 | ✅ **Resolved v1.2** — `BREACH_REGISTER.md` procedure documented; Winston structured JSON logger implemented — auth events (login/logout/register/password reset) emit persistent structured logs with userId + IP | **High** | ✅ Closed |
| C-11 | Data Protection Impact Assessment (DPIA) | UK GDPR | 35 | ✅ **Resolved v1.1** — `DPIA.md` completed; all risks assessed; residual risks Low–Medium; processing approved with conditions | **Medium** | ✅ Closed |
| C-12 | Cookie notice (PECR) | PECR 2003 | Regulation 6 | ✅ **Resolved v1.1** — Cookie disclosure included in Privacy Policy §5 | **Low** | ✅ Closed |
| C-13 | Age verification | UK GDPR | 8 | ✅ **Resolved v1.1** — Age confirmation checkbox added to signup form; submit blocked until confirmed | **Low** | ✅ Closed |

---

## 14. Remediation Plan

Prioritised actions to bring the application into compliance. Items reference the Gap Register (§13).

### Priority 1 — Critical (before any real users)

| Gap | Action | Effort | Notes |
|-----|--------|--------|-------|
| C-01 | Write and display a Privacy Notice at registration and link it in the footer | Medium | Must cover: controller identity, purpose, lawful basis, retention, rights, ICO contact |
| C-09 | Register with the ICO as a data controller | Low | Online via ico.org.uk; annual fee ~£40 for small organisations; takes ~15 minutes |

### Priority 2 — High (before public launch)

| Gap | Action | Effort | Notes |
|-----|--------|--------|-------|
| C-02 / C-04 | Build a data export endpoint (`GET /users/:id/export`) returning the user's profile and all transactions as JSON | Medium | Satisfies both right of access (Art. 15) and portability (Art. 20) |
| C-08 | Review and formally accept Plaid's Data Processing Addendum; select and DPA-review SMTP provider | Low | Plaid DPA available at plaid.com/legal/data-processing-addendum |
| C-10 | Document a breach response procedure: detection triggers, ICO notification checklist, data subject notification template | Medium | Pair with R-03 (structured logging) from SECURITY.md residual risk register |

### Priority 3 — Medium (within first sprint post-launch)

| Gap | Action | Effort | Notes |
|-----|--------|--------|-------|
| C-03 | Implement account suspension / data freeze toggle (restricts processing without deleting account) | Medium | Simple flag on User model + API endpoint |
| C-05 | Provide a contact email/form for rights requests; document internal response SLA | Low | Does not require code — can be email address in Privacy Notice with internal documented process |
| C-07 | Define and document retention periods; implement inactive account flag after N months with warning email | Medium | Decide policy first, then automate enforcement |
| C-11 | Complete a formal DPIA using the ICO's published template | Medium | ICO DPIA template available at ico.org.uk |

### Priority 4 — Low (ongoing / best practice)

| Gap | Action | Effort | Notes |
|-----|--------|--------|-------|
| C-06 | Add brief disclosure of health score methodology to the Analytics page | Low | "Your score is calculated from transaction frequency, amount trends, and budget adherence" |
| C-12 | Add one-line cookie disclosure to the Privacy Notice | Low | "We use one strictly necessary cookie (rt) to maintain your session" |
| C-13 | Add age declaration checkbox to registration ("I confirm I am 13 years of age or older") | Low | Frontend change only; Terms of Service link alongside |

---

## 15. Compliance Posture Summary

| Domain | Standard | Status |
|--------|---------|--------|
| Data protection — transparency | UK GDPR Arts. 13–14 | ✅ Compliant — Privacy Policy built and linked |
| Data protection — lawful basis | UK GDPR Art. 6 | ✅ Compliant — basis identified and disclosed in Privacy Policy |
| Data protection — data subject rights | UK GDPR Arts. 15–22 | ✅ Compliant — access, rectification, erasure, portability, restriction all implemented; objection contact published |
| Data protection — security | UK GDPR Art. 32 | ✅ Compliant (see SECURITY.md) |
| Data protection — processors | UK GDPR Art. 28 | ⚠️ Partial — DPA_RECORDS.md created; Plaid DPA acceptance and SMTP provider selection pending admin action |
| Data protection — breach response | UK GDPR Arts. 33–34 | ⚠️ Partial — BREACH_REGISTER.md and procedure created; structured logging (Winston) still pending |
| Data protection — impact assessment | UK GDPR Art. 35 | ✅ Compliant — DPIA.md completed; processing approved |
| Data protection — retention | UK GDPR Art. 5(1)(e) | ⚠️ Partial — policy documented; inactive account automation pending |
| ICO registration | DPA 2018 s.108 | ❌ Not registered — requires admin action |
| Cookies | PECR 2003 | ✅ Compliant — strictly necessary cookie only; disclosed in Privacy Policy |
| Application security — access control | OWASP A01 | ✅ Compliant |
| Application security — cryptography | OWASP A02 | ⚠️ Partial (HTTPS infrastructure gap) |
| Application security — injection | OWASP A03 | ✅ Compliant |
| Application security — insecure design | OWASP A04 | ✅ Compliant |
| Application security — misconfiguration | OWASP A05 | ✅ Compliant |
| Application security — dependencies | OWASP A06 | ⚠️ Partial (no automated monitoring) |
| Application security — authentication | OWASP A07 | ⚠️ Partial (no MFA; no lockout) |
| Application security — data integrity | OWASP A08 | ✅ Compliant |
| Application security — logging & monitoring | OWASP A09 | ✅ Compliant |
| Application security — SSRF | OWASP A10 | ✅ N/A — Compliant |

---

## 16. Attestation

**Assessed by:** Rameez (developer / data controller, Secure Bank project)  
**Assessment date:** 2026-04-26  
**Capacity:** Data Controller under UK GDPR / DPA 2018  
**Methodology:** Article-by-article self-assessment against UK GDPR; PECR review; OWASP Top 10 2021 compliance overlay; ICO guidance consulted  

This report documents the compliance posture of the Secure Bank application as of the date above. All findings have been recorded in good faith. Gaps are documented in the Compliance Gap Register (§13) with a prioritised remediation plan (§14).

> **Important:** This is a self-assessment. It has not been reviewed by a qualified data protection professional or solicitor. Legal advice is recommended before serving real users, given the financial nature of the data processed. The ICO's free guidance at ico.org.uk is the authoritative reference for UK GDPR obligations.

**Signature:** _____________________ &nbsp;&nbsp;&nbsp; **Date:** 2026-04-26
