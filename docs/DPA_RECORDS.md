# Data Processing Agreement Records — Secure Bank

**Document type:** Article 28 UK GDPR — processor relationship records  
**Owner:** Rameez (data controller)  
**Purpose:** Record of all Data Processing Agreements with third-party processors acting on behalf of Secure Bank.

---

## Overview

Under Article 28 UK GDPR, a data controller must only use processors that provide sufficient guarantees of appropriate technical and organisational measures, and must formalise this relationship via a Data Processing Agreement (DPA). This document records the status of all such agreements.

---

## Processor Register

### Processor 1 — Plaid Inc.

| Field | Detail |
|-------|--------|
| **Processor name** | Plaid Inc. |
| **Registered address** | 1098 Harrison Street, San Francisco, CA 94103, USA |
| **Processing activity** | Bank account data aggregation — exchanges Plaid public tokens for access tokens; provides transaction data and account balance data to the application |
| **Data categories processed** | Bank account numbers (hashed/tokenised by Plaid), transaction records (merchant, amount, date, category), account balance |
| **Data subjects** | Registered users who choose to link a bank account |
| **Transfer mechanism** | API calls from backend server to Plaid API. Plaid is a US company — transfer covered by Plaid's Standard Contractual Clauses (SCCs) with EU/UK authorities |
| **Plaid certifications** | SOC 2 Type II, PCI DSS Level 1 |
| **DPA location** | Plaid Data Processing Addendum — available at: https://plaid.com/legal/data-processing-addendum |
| **DPA accepted** | ❌ Not yet formally accepted — **required action before serving real users** |
| **Date accepted** | — |
| **Review date** | Annually or on material change to Plaid's terms |
| **Notes** | Plaid operates in sandbox mode during development. No real bank credentials are processed until production mode is enabled. Production use requires formal DPA acceptance. |

---

### Processor 2 — SMTP Email Provider

| Field | Detail |
|-------|--------|
| **Processor name** | Not yet selected |
| **Processing activity** | Delivery of transactional emails (password reset links) to registered users |
| **Data categories processed** | Email address; reset URL (contains single-use token) |
| **Data subjects** | Users who request a password reset |
| **DPA required** | Yes — required before production deployment |
| **DPA accepted** | ❌ Not applicable — provider not yet selected |
| **Candidate providers** | SendGrid (Twilio) — DPA available; AWS SES — DPA available via AWS DPA; Mailgun — DPA available |
| **Notes** | In development, the SMTP provider is bypassed and reset links are logged to the server console. No personal data is transmitted to a third party in this mode. |

---

## Action Items

| Processor | Required Action | Priority |
|-----------|----------------|----------|
| Plaid Inc. | Review and accept Plaid's Data Processing Addendum at plaid.com/legal/data-processing-addendum | **High — before production** |
| SMTP provider | Select provider, review their DPA, formally accept, and update this record | **High — before production** |

---

*DPA Records v1.0 — 2026-04-26*
