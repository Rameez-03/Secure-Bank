# Data Protection Impact Assessment — Secure Bank

**Document type:** Article 35 UK GDPR — Data Protection Impact Assessment  
**Template:** Based on ICO DPIA guidance (ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/data-protection-impact-assessments-dpias/)  
**Date completed:** 2026-04-26  
**Completed by:** Rameez (data controller)  
**Status:** Complete — accepted with mitigations in place

---

## Step 1 — Describe the Processing

### 1.1 Nature of Processing

Secure Bank is a personal finance management application that:

- Collects and stores user profile data (name, email, hashed password)
- Stores financial transaction records entered manually by users
- Integrates with Plaid Inc. to import real bank transaction data from linked accounts
- Calculates an automated financial health score from transaction history
- Provides visualisation and analytics of spending patterns

### 1.2 Scope

| Dimension | Detail |
|-----------|--------|
| Volume of data | Per-user: profile (< 1 KB), transactions (variable, typically < 500 records / user) |
| Categories of data | Personal identifiers (name, email); financial data (amounts, merchants, dates, categories); authentication credentials (hashed) |
| Data subjects | Registered users — adults (13+) who voluntarily create accounts |
| Frequency | Continuous — data created and accessed on each user session |
| Duration | Indefinitely until account deletion |
| Geographic scope | UK-based developer; user base currently limited to development/testing |

### 1.3 Context

- Innovative technology: Plaid bank aggregation API is a relatively novel technology in consumer finance
- No special category data (Article 9) is processed — financial data is not classified as special category under UK GDPR
- No children's data specifically targeted — minimum age declaration (13) in place at registration
- Processing is at small scale — single-developer portfolio application, not a commercial service

### 1.4 Purpose

The purpose of processing is to provide users with personal finance management tools: transaction tracking, budget monitoring, spending analytics, and financial health insights. There is no secondary use of data for analytics, marketing, or third-party sharing beyond Plaid (as processor).

---

## Step 2 — Assess Necessity and Proportionality

| Consideration | Assessment |
|--------------|------------|
| **Lawful basis** | Primarily Art. 6(1)(b) — performance of contract. Bank linking uses Art. 6(1)(a) — consent (explicit opt-in). Both are valid and documented in COMPLIANCE.md §4. |
| **Proportionality** | Data collected is limited to what is necessary for stated purposes (see COMPLIANCE.md §7 — data minimisation assessment: all fields confirmed necessary). No excessive collection identified. |
| **Purpose limitation** | Data used only for personal finance features. No advertising, profiling, or third-party data sharing beyond documented processors. |
| **Data minimisation** | Sensitive internal fields (`plaidCursor`, `plaidItemId`, `password`, `accessToken`) stripped from all API responses. Only data necessary for each feature is returned. |
| **Retention** | Documented in DATA_RETENTION_POLICY.md. Inactive account deletion after 24 months with warning. Password reset tokens expire after 1 hour. |
| **Data subject rights** | All applicable rights implemented or documented: access, rectification, erasure, portability, restriction. See COMPLIANCE.md §5. |
| **Transparency** | Privacy Policy accessible at `/privacy-policy` and linked from registration. Covers all Article 13 required disclosures. |
| **Processor safeguards** | Plaid holds SOC 2 Type II and PCI DSS Level 1. DPA to be formally accepted before production. |

---

## Step 3 — Identify and Assess Risks

| # | Risk | Likelihood | Severity | Initial Risk |
|---|------|-----------|----------|-------------|
| R1 | Database breach exposes user financial transaction data | Low | High | **Medium** |
| R2 | Database breach exposes Plaid access tokens, enabling bank account access | Low | Critical | **High** |
| R3 | Account takeover via stolen session token | Low | High | **Medium** |
| R4 | Unauthorised access to another user's transactions (IDOR) | Low | High | **Medium** |
| R5 | Financial data used for purposes beyond user's expectation | Very Low | High | **Low** |
| R6 | User unable to exercise erasure right, leading to indefinite retention | Very Low | Medium | **Low** |
| R7 | Password reset token intercepted in email transit, enabling account takeover | Low | High | **Medium** |
| R8 | Automated health score used as basis for discriminatory decision by third party | Very Low | Medium | **Low** |

---

## Step 4 — Identify Mitigations

| Risk | Mitigation Measures | Residual Risk |
|------|--------------------|--------------| 
| R1 | MongoDB Atlas encryption at rest; access controls; no unnecessary fields in responses; `select: false` on sensitive fields | **Low** |
| R2 | AES-256-GCM encryption of Plaid tokens at rest (`encrypt.js`); decryption only in-memory, never serialised to API responses | **Low** |
| R3 | JWT access tokens in-memory only (15 min TTL); refresh token in httpOnly cookie (inaccessible to JavaScript); rate limiting on auth endpoints | **Low** |
| R4 | All queries scoped to `req.user.userId` extracted from verified JWT — never from request input | **Very Low** |
| R5 | Privacy Policy clearly states no secondary use; no analytics or marketing processing; no third-party data sharing except documented processors | **Very Low** |
| R6 | Delete Account feature available in Settings → Danger Zone; immediately deletes all user data and revokes Plaid access | **Very Low** |
| R7 | Reset token is 32 bytes (256-bit entropy); SHA-256 hash-on-store (raw token never in DB); single-use; 1-hour expiry | **Low** |
| R8 | Privacy Policy §7 explicitly states health score is informational only; no API to share score with third parties; no automated decision with legal effect | **Very Low** |

---

## Step 5 — Sign Off

**Overall residual risk assessment:** The processing activities described carry **Low to Medium residual risk** after mitigations. No high residual risks were identified. The processing is justified by the legitimate purpose, proportionate to the data collected, and adequately protected by the technical controls documented in SECURITY.md.

**DPO consultation required:** No — this application does not meet the threshold for a mandatory DPO appointment (Article 37 UK GDPR). Scale is below the threshold for large-scale systematic processing.

**ICO prior consultation required (Article 36):** No — residual risks are not "high" after mitigations.

**Decision:** Processing may proceed subject to:
1. Formal acceptance of Plaid's Data Processing Addendum before production (DPA_RECORDS.md)
2. ICO registration as a data controller (COMPLIANCE.md C-09)
3. Inactive account deletion automation being implemented before scaling to real users (DATA_RETENTION_POLICY.md §3)

**Completed by:** Rameez &nbsp;&nbsp;&nbsp; **Date:** 2026-04-26

**Review date:** 2027-04-26 (annual), or on material change to processing activities

---

*DPIA v1.0 — 2026-04-26*
