# Data Retention Policy — Secure Bank

**Version:** 1.0  
**Date:** 2026-04-26  
**Owner:** Rameez (data controller)  
**Review cycle:** Annually or on material change to data processing activities

---

## 1. Purpose

This policy defines how long Secure Bank retains personal data and the process by which data is deleted when retention periods expire. It satisfies the **storage limitation principle** under Article 5(1)(e) UK GDPR, which requires that personal data be "kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed."

---

## 2. Retention Schedule

| Data Category | Retention Period | Trigger for Deletion | Legal Basis |
|--------------|-----------------|----------------------|-------------|
| User account (name, email, password hash) | Until account deletion | User-initiated via Settings → Delete Account | Art. 5(1)(e) — no longer necessary once account deleted |
| Financial transaction records | Until account deletion or per-transaction deletion | User-initiated | Art. 5(1)(e) |
| Monthly budget | Until account deletion | User-initiated | Art. 5(1)(e) |
| Plaid access token (encrypted) | Until bank unlink or account deletion | User-initiated via Settings → Disconnect Bank | Art. 5(1)(e) |
| Password reset token (SHA-256 hash) | 1 hour from generation | Automatic — `resetPasswordExpires` field enforced at query level | Minimisation — token has no value beyond its function |
| JWT refresh token (httpOnly cookie) | 7 days from issuance | Automatic — cookie `maxAge` + `logout` endpoint clears cookie | Minimisation |
| JWT access token (in-memory) | 15 minutes | Automatic — token TTL | Minimisation |
| `lastLoginAt` timestamp | Until account deletion | Deleted with account | Art. 5(1)(e) |
| **Inactive accounts** | **24 months of no login activity** | **Automated process — see §3** | Art. 5(1)(e) |

---

## 3. Inactive Account Process

Accounts where no login has been recorded for **24 months** (tracked via `lastLoginAt` field on the User model) are subject to the following process:

| Stage | Action | Timing |
|-------|--------|--------|
| Warning | Email sent to registered address informing the user their account will be deleted in 30 days | At 24-month inactivity mark |
| Grace period | Account remains active; user may log in to reset the inactivity clock | 30 days after warning |
| Deletion | If no login occurs during the grace period, the account and all associated data are deleted using the same flow as user-initiated account deletion | 30 days after warning email |

**Implementation status:** `lastLoginAt` field is implemented and updated on login. Automated warning email and scheduled deletion are pending implementation (see COMPLIANCE.md C-07).

---

## 4. Deletion Process

When an account is deleted (either user-initiated or via the inactive account process), the following steps are executed:

1. Best-effort Plaid `itemRemove` call to revoke bank access at the Plaid level
2. `Transaction.deleteMany({ userId })` — removes all transaction documents
3. `User.findByIdAndDelete` — removes the user document
4. Server clears the `rt` httpOnly refresh token cookie
5. All in-memory session state (access token) is invalidated on the next request

No backup copies of deleted user data are retained beyond the deletion event.

---

## 5. Legal Holds

In the event of a legal hold (e.g. a court order, regulatory investigation, or pending legal claim), the above retention periods may be suspended for the specific data subject(s) involved until the hold is lifted. Legal holds will be documented separately.

---

## 6. Review

This policy will be reviewed:
- Annually from the date above
- When a material change to data processing activities occurs
- Following any personal data breach involving retention failures

---

*Data Retention Policy v1.0 — 2026-04-26*
