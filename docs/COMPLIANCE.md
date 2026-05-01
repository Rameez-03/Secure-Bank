# Compliance Audit Report — Secure Bank

**Classification:** Internal — Restricted  
**Project:** Secure Bank (full-stack personal finance application)  
**Audit Type:** Self-assessment — regulatory and application security compliance  
**Auditor:** Rameez (developer / data controller)  
**Report Status:** Near-compliant — 2 admin actions outstanding (ICO registration, Plaid DPA acceptance)

---

## Document Control

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-04-26 | Initial compliance audit — UK GDPR, OWASP Top 10, gap register |
| 1.1 | 2026-04-26 | Implementation sprint: Privacy Policy built; data export/portability implemented; processing restriction toggle; health score disclosed; retention policy documented; DPIA, BREACH_REGISTER, DPA_RECORDS created; age verification added |
| 2.0 | 2026-05-01 | Second audit: updated all statuses to reflect current state — Snyk continuous scanning closes A06; account lockout confirmed closes A07 lockout gap; Winston logging + n8n/Slack real-time alerting fully closes C-10; document condensed for readability |

---

## 1. Scope & Methodology

| Area | Description |
|------|-------------|
| UK GDPR / DPA 2018 | Data protection obligations as a UK data controller |
| PECR 2003 | Cookie and electronic communications obligations |
| OWASP Top 10 (2021) | Application security compliance overlay |
| ICO Registration | DPA 2018, Part 4, s.108 |

**Out of scope:** EU GDPR (UK only), PCI DSS (no cardholder data processed — Plaid handles this), FCA (non-commercial portfolio app).

| Role | Entity |
|------|--------|
| Data Controller | Secure Bank / Rameez |
| Data Processor | Plaid Inc. |
| Data Subjects | App users |
| Supervisory Authority | ICO (UK) |

---

## 2. UK GDPR Article Compliance

| Article | Subject | Status |
|---------|---------|--------|
| 5 | Processing principles (lawfulness, minimisation, storage limitation, integrity) | ✅ Met |
| 6 | Lawful basis for processing | ✅ Met — documented in Privacy Policy |
| 13–14 | Transparency / Privacy Notice | ✅ Met — Privacy Policy at `/privacy-policy` |
| 15 | Right of access | ✅ Met — data export endpoint implemented |
| 16 | Right to rectification | ✅ Met — name and email editable in Settings |
| 17 | Right to erasure | ✅ Met — delete account implemented |
| 18 | Right to restriction of processing | ✅ Met — `isRestricted` flag + Settings toggle |
| 20 | Right to data portability | ✅ Met — JSON export satisfies portability |
| 21 | Right to object | ⚠️ Partial — contact email published; formal response process not documented |
| 22 | Automated decision-making | ✅ Met — health score methodology disclosed (non-Art. 22 decision) |
| 28 | Processor agreements | ⚠️ Partial — DPA_RECORDS.md created; Plaid DPA not yet formally accepted |
| 30 | Records of processing activities | ✅ Met — ROPA documented below (§3) |
| 32 | Security of processing | ✅ Met — see SECURITY.md |
| 33–34 | Breach notification | ✅ Met — BREACH_REGISTER.md procedure + Winston logging + n8n/Slack real-time alerting |
| 35 | Data Protection Impact Assessment | ✅ Met — DPIA.md completed |

**ICO Registration (DPA 2018, s.108):** ❌ Not yet registered — admin action required at ico.org.uk (~£40/year).

---

## 3. Records of Processing Activities (ROPA) — Article 30

| # | Activity | Data Categories | Lawful Basis | Retention | Third Parties |
|---|----------|----------------|-------------|-----------|---------------|
| 1 | Account management | Name, email, hashed password, timestamps | 6(1)(b) — contract | Until deletion | None |
| 2 | Authentication & sessions | Email, JWT (memory), refresh token (httpOnly cookie) | 6(1)(b) — contract | Access: 15 min; refresh: 7 days | None |
| 3 | Transaction tracking | Amount, description, category, date, pending | 6(1)(b) — contract | Until deletion | None |
| 4 | Bank account integration | Encrypted Plaid token, item ID, imported transactions | 6(1)(a) — consent | Until unlink/deletion | Plaid Inc. |
| 5 | Budget tracking | Monthly budget (£) | 6(1)(b) — contract | Until deletion | None |
| 6 | Password recovery | Email, hashed reset token | 6(1)(b) — contract | Token: 1 hr (auto-expiry) | SMTP provider |
| 7 | Financial health score | Aggregated transaction records | 6(1)(b) — contract | Calculated on request; not stored | None |

### Data Flow

```
Browser → Express API → MongoDB
              │
              ├── bcrypt (passwords)
              ├── AES-256-GCM (Plaid tokens)
              └── Plaid API → Plaid Inc. (processor)
```

Plaid tokens are decrypted in-memory only for API calls; plaintext never persisted.

---

## 4. Data Subject Rights

| Right | Article | Implementation | Status |
|-------|---------|----------------|--------|
| Right to be informed | 13–14 | Privacy Policy at `/privacy-policy` | ✅ |
| Right of access | 15 | `GET /api/users/:id/export` — full JSON export | ✅ |
| Right to rectification | 16 | Name, email, budget editable in Settings | ✅ |
| Right to erasure | 17 | Delete account — removes user, transactions, revokes Plaid | ✅ |
| Right to restriction | 18 | `isRestricted` flag blocks writes + Plaid sync | ✅ |
| Right to portability | 20 | Satisfied by same JSON export (machine-readable) | ✅ |
| Right to object | 21 | Contact email published in Privacy Policy | ⚠️ Partial |
| Automated decisions | 22 | Health score disclosed as non-Article 22; methodology in Analytics page | ✅ |

---

## 5. Security Measures — Article 32

| Measure | Implementation | Status |
|---------|----------------|--------|
| Encryption at rest | AES-256-GCM (Plaid tokens); bcrypt 12 rounds (passwords) | ✅ |
| Encryption in transit | HTTPS not yet enforced at application layer — deployment dependency | ⚠️ |
| Access control | JWT auth; all queries scoped to `req.user.userId`; no admin panel | ✅ |
| Rate limiting | `express-rate-limit` on auth endpoints; 429 + alert on trigger | ✅ |
| Monitoring & alerting | Winston structured JSON logging + n8n/Slack real-time security alerting (HIGH/MEDIUM events) | ✅ |
| Security testing | Arko SAST (59% → 48% hackable); Snyk (0 CVEs post-fix); Trivy CVE scan in CI | ✅ |

---

## 6. Third-Party Processors — Article 28

| Processor | Data Shared | Compliance | DPA Status |
|-----------|------------|------------|------------|
| Plaid Inc. | Plaid public/access token, transaction records | SOC 2 Type II; PCI DSS Level 1; GDPR-compliant DPA available | ⚠️ DPA not yet formally accepted |
| SMTP provider | Destination email (password reset) | Depends on provider chosen | ⚠️ Provider not yet selected (dev: console fallback) |

Full processor register: [DPA_RECORDS.md](DPA_RECORDS.md)

---

## 7. Breach Response Readiness — Articles 33–34

| Capability | Implementation | Status |
|-----------|----------------|--------|
| Breach detection | Winston structured JSON logging (all auth events); n8n/Slack HIGH-severity alerts fire immediately for: account lockout, forged JWT, auth rate limit hit, account deletion | ✅ |
| Breach assessment procedure | Documented in BREACH_REGISTER.md with severity classification | ✅ |
| ICO notification (72-hour window) | Procedure documented in BREACH_REGISTER.md; ICO portal: ico.org.uk/report-a-breach | ✅ |
| Data subject notification | Template documented; email delivery capability (SMTP provider pending) | ⚠️ Partial |
| Breach register | BREACH_REGISTER.md maintained per Article 33(5) | ✅ |

Full procedure: [BREACH_REGISTER.md](BREACH_REGISTER.md)

---

## 8. OWASP Top 10 Assessment (2021)

| # | Risk | Key Controls | Status |
|---|------|-------------|--------|
| A01 | Broken Access Control | IDOR protection (`userId` scoping on all queries); CORS whitelist; ownership checks | ✅ **Compliant** |
| A02 | Cryptographic Failures | bcrypt 12 rounds; AES-256-GCM; httpOnly cookies; HTTPS pending deployment | ⚠️ **Partial** — HTTPS infrastructure gap |
| A03 | Injection | `express-mongo-sanitize`; `hpp`; ODM parameterised queries; server-side validation | ✅ **Compliant** |
| A04 | Insecure Design | STRIDE threat model; rate limiting; `isManual` guard; timing-safe login; enumeration prevention | ✅ **Compliant** |
| A05 | Security Misconfiguration | Helmet (CSP/HSTS); CORS whitelist; generic 500 in production; no insecure defaults | ✅ **Compliant** |
| A06 | Vulnerable & Outdated Components | Snyk continuous dependency + container scanning; automated fix PRs; 0 CVEs post-fix | ✅ **Compliant** |
| A07 | Identification & Authentication Failures | Account lockout after 5 failed attempts (15-min lock); strong password policy; httpOnly cookies; JWT rotation; no MFA | ⚠️ **Partial** — no MFA (accepted scope limitation) |
| A08 | Software & Data Integrity | `package-lock.json`; no custom deserialisation; no untrusted update channels | ✅ **Compliant** |
| A09 | Security Logging & Monitoring | Winston structured JSON audit log; Arko SAST; Snyk; Trivy CVE in CI; n8n + Slack real-time alerting | ✅ **Compliant** |
| A10 | SSRF | No server-side URL fetches from user input | ✅ **N/A — Compliant** |

**Summary:** 8 Compliant / 2 Partial (HTTPS infrastructure, MFA)

---

## 9. Compliance Gap Register

| ID | Requirement | Status | Outstanding Action |
|----|-------------|--------|--------------------|
| C-01 | Privacy Notice | ✅ **Resolved v1.1** | — |
| C-02 | Right of access / data export | ✅ **Resolved v1.1** | — |
| C-03 | Right to restriction of processing | ✅ **Resolved v1.1** | — |
| C-04 | Right to data portability | ✅ **Resolved v1.1** | — |
| C-05 | Right to object | ⚠️ **Partial** | Set up `privacy@securebank.app`; document internal response SLA |
| C-06 | Automated decision disclosure | ✅ **Resolved v1.1** | — |
| C-07 | Data retention policy | ⚠️ **Partial** | Policy documented; automated inactive-account deletion not yet built |
| C-08 | Data Processing Agreements | ⚠️ **Pending** | Accept Plaid DPA at plaid.com/legal/data-processing-addendum; select and DPA-review SMTP provider |
| C-09 | ICO Registration | ❌ **Pending** | Register at ico.org.uk (~£40/year, ~15 min) |
| C-10 | Breach response procedure | ✅ **Resolved v2.0** | BREACH_REGISTER.md + Winston logging + n8n/Slack alerting (HIGH events: immediate; MEDIUM: throttled per IP) |
| C-11 | DPIA | ✅ **Resolved v1.1** | — |
| C-12 | Cookie notice (PECR) | ✅ **Resolved v1.1** | — |
| C-13 | Age verification | ✅ **Resolved v1.1** | — |

**Outstanding items requiring admin action: C-08 (Plaid DPA + SMTP DPA), C-09 (ICO registration)**

---

## 10. Compliance Posture Summary

| Domain | Standard | Status |
|--------|---------|--------|
| Transparency / Privacy Notice | UK GDPR Arts. 13–14 | ✅ Compliant |
| Lawful basis | UK GDPR Art. 6 | ✅ Compliant |
| Data subject rights | UK GDPR Arts. 15–22 | ✅ Compliant (objection contact ⚠️ partial) |
| Security of processing | UK GDPR Art. 32 | ✅ Compliant (HTTPS pending deployment) |
| Processor agreements | UK GDPR Art. 28 | ⚠️ Partial — Plaid DPA acceptance pending |
| Breach response | UK GDPR Arts. 33–34 | ✅ Compliant |
| DPIA | UK GDPR Art. 35 | ✅ Compliant |
| Data retention | UK GDPR Art. 5(1)(e) | ⚠️ Partial — policy documented; automation pending |
| ICO registration | DPA 2018 s.108 | ❌ Pending admin action |
| Cookies | PECR 2003 | ✅ Compliant — strictly necessary only; disclosed |
| Access control | OWASP A01 | ✅ Compliant |
| Cryptography | OWASP A02 | ⚠️ Partial — HTTPS infrastructure gap |
| Injection | OWASP A03 | ✅ Compliant |
| Insecure design | OWASP A04 | ✅ Compliant |
| Misconfiguration | OWASP A05 | ✅ Compliant |
| Outdated components | OWASP A06 | ✅ Compliant — Snyk continuous scanning |
| Authentication | OWASP A07 | ⚠️ Partial — no MFA |
| Data integrity | OWASP A08 | ✅ Compliant |
| Logging & monitoring | OWASP A09 | ✅ Compliant |
| SSRF | OWASP A10 | ✅ N/A — Compliant |

**Overall: 15 Compliant / 4 Partial / 1 Pending admin action**

---

## 11. Attestation

**Assessed by:** Rameez (developer / data controller, Secure Bank)  
**v1.0/v1.1 assessment date:** 2026-04-26  
**v2.0 assessment date:** 2026-05-01  
**Methodology:** Article-by-article UK GDPR self-assessment; PECR review; OWASP Top 10 2021 overlay; ICO guidance consulted

> **Note:** This is a self-assessment. It has not been reviewed by a qualified data protection professional. Legal advice is recommended before serving real users. ICO's guidance at ico.org.uk is the authoritative reference.

**Signature:** _____________________ &nbsp;&nbsp;&nbsp; **Date:** 2026-05-01
