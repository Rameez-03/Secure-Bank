# DevSecOps Pipeline — SecureBank

Security is integrated across the full development lifecycle — from static analysis at write time, to vulnerability scanning on every push, to real-time alerting in production. This document covers the tooling, findings, and design decisions.

---

## Pipeline Overview

```
Code commit
     │
     ├── GitHub Actions CI ──── Jest tests (38) + Trivy CVE scan
     │
     ├── Snyk ────────────────── Dependency + Docker image scanning (continuous)
     │
     ├── Arko ────────────────── SAST threat model + hackable score
     │
     └── n8n + Slack ─────────── Real-time security event alerting (production)
```

| Tool | Role |
|------|------|
| **GitHub Actions** | CI pipeline — automated tests and container scans on every push |
| **Trivy** | Docker image CVE scanning (CRITICAL/HIGH) |
| **Snyk** | Dependency and container scanning with automated fix PRs |
| **Arko** | AI-powered SAST — threat model, compliance mapping, hackable score |
| **n8n** | Workflow automation — routes security events from backend to Slack |
| **Slack** | Real-time security alert delivery with severity routing |

---

## CI Pipeline — GitHub Actions

![CI](https://github.com/Rameez-03/Secure-Bank/actions/workflows/ci.yml/badge.svg)

Every push to `main` triggers two jobs running in parallel:

| Job | Steps |
|-----|-------|
| `test` | Checkout → Node 20 → `npm install` → `npm test` (38 Jest tests) |
| `scan` | Checkout → Build backend image → Build frontend image → Trivy scan both |

Trivy scans for CRITICAL and HIGH CVEs in both Docker images. The Snyk GitHub integration runs as a third check on all pull requests.

---

## SAST — Arko

Arko performed a static application security test against the full codebase, producing a threat model, compliance mapping, and a Hackable Score. Two scans were run — before and after remediation.

### Initial Scan — 59% Hackable Score

![Arko Initial Scan](docs/screenshots/ArkoScan1.png)

Two HIGH findings identified in `docker-compose.yml`:

| Finding | Detail | Risk |
|---------|--------|------|
| CORS origin misconfiguration | `CORS_ORIGIN` set to `http://localhost` — plaintext HTTP in production enables MitM interception of JWT tokens and cookies | HIGH |
| Secrets via env_file | `env_file: ./backend/.env` loads JWT keys, Plaid credentials, encryption key as plain env vars | HIGH |

### Threat Model & Compliance View

![Arko Threat Model](docs/screenshots/ArkoThreatModel.png)
![Arko Compliance](docs/screenshots/ArkoCompliance.png)

### Remediation

Both findings were addressed by removing hardcoded values from `docker-compose.yml` and replacing them with parameterised environment variables (`${CORS_ORIGIN}`, `${FRONTEND_URL}`) with no insecure defaults. This eliminates the hardcoded HTTP literal and ensures no credentials are baked into the Compose file.

### Post-Remediation Rescan — 48% Hackable Score

![Arko Rescan](docs/screenshots/ArkoScan2.png)

| Scan | Score | Findings | Outcome |
|------|-------|----------|---------|
| Initial | 59% Elevated Risk | 2 HIGH | Remediated |
| Post-fix | 48% | 4 infrastructure gaps | Accepted — documented as R-10, R-11 in `SECURITY.md` |

Remaining 4 findings are all infrastructure-level (HTTPS provisioning, secrets manager) — not application code defects. Accepted risks pending domain and TLS setup.

---

## Dependency & Container Scanning — Snyk

Snyk is integrated via GitHub and monitors 4 project targets continuously:

- `backend/package.json`
- `frontend/package.json`
- `backend/Dockerfile`
- `frontend/Dockerfile`

### Initial Scan

![Snyk Initial Dashboard](docs/screenshots/SnykDashboard.png)

Three CVEs found in the `frontend/Dockerfile` — all in OS-level packages bundled with the `nginx:alpine` base image. No vulnerabilities in application dependencies or the backend image.

| Target | Findings | Detail |
|--------|----------|--------|
| `backend/Dockerfile` | 0 | `node:20-alpine` is up to date |
| `backend/package.json` | 0 | Clean |
| `frontend/package.json` | 0 | Clean |
| `frontend/Dockerfile` | 1 Medium, 2 Low | `xz/xz-libs` (heap overflow), `libxpm`, `nghttp2` |

### Automated Fix PR

![Snyk Fix PR](docs/screenshots/SnykFixPr.png)

Snyk automatically opened a pull request to upgrade the base image from `nginx:alpine` to `nginx:1.30.0-alpine3.23-slim`. The PR triggered the full CI pipeline:

![PR Checks Passing](docs/screenshots/PRMerge.png)

All 3 checks passed — Jest tests, Trivy scan, Snyk verification. PR merged into `main`.

### Post-Fix Rescan — 0 Vulnerabilities

![Snyk Clean Dashboard](docs/screenshots/SnykDashboard2.png)

All 4 targets: **0 Critical / 0 High / 0 Medium / 0 Low**.

Full cycle: automated scan → CVE identification → fix PR → CI gate → merge → clean rescan — completed entirely within the pipeline with no manual intervention.

---

## Real-Time Security Alerting — n8n + Slack

Security events emitted by the backend are forwarded to an **n8n** automation workflow via webhook, which routes alerts to a dedicated **#security-alerts** Slack channel.

### Architecture

```
Backend event fires (e.g. login.account_locked)
     │
     ▼
sendAlert() — POST to n8n webhook (fire and forget, non-blocking)
     │
     ▼
n8n workflow — Webhook node → HTTP Request node
     │
     ▼
Slack Incoming Webhook → #security-alerts channel
```

### n8n Workflow

![n8n Workflow](docs/screenshots/n8nWorkflow.png)

The workflow is two nodes: a **Webhook** trigger that receives POST requests from the backend, and an **HTTP Request** node that forwards the payload to the Slack Incoming Webhook URL.

### Alert Design — Solving Alert Fatigue

A naive implementation sends every security event to Slack. At any real scale this creates noise that gets ignored — which is as dangerous as no alerting at all. The alerting layer solves this with two controls:

**Severity routing** — events are classified into three tiers. LOW events (new registrations, bank account linked) are written to the Winston structured log only and never sent to Slack. Only MEDIUM and HIGH events reach the channel.

**Throttling** — MEDIUM events are throttled to one alert per 5 minutes per IP address. A brute force attempt sends one alert, not hundreds. HIGH events always bypass throttling and fire immediately every time.

| Severity | Behaviour | Examples |
|----------|-----------|---------|
| 🔴 HIGH | Immediate, every time, no throttle | Account locked, forged JWT, auth rate limit hit, account deleted |
| 🟡 MEDIUM | Once per 5 min per IP | Failed login, password reset, data export, bank unlinked |
| ⚪ LOW | Winston log only — no Slack alert | New registration, bank account linked |

### Events Monitored

| Event | Severity | Why It Matters |
|-------|----------|---------------|
| `login.account_locked` | HIGH | Brute force attack in progress |
| `auth.invalid_token` | HIGH | Forged or replayed JWT — active token attack |
| `rate_limit.auth` | HIGH | Automated attack against auth endpoints |
| `account.deleted` | HIGH | Permanent data destruction |
| `login.failed` | MEDIUM | Credential stuffing pattern indicator |
| `login.locked` | MEDIUM | Repeated attempt on a locked account |
| `password.reset.requested` | MEDIUM | Potential account takeover attempt |
| `password.reset.completed` | MEDIUM | Password changed via reset flow |
| `data.export` | MEDIUM | Full data export — data exfiltration risk |
| `plaid.bank_unlinked` | MEDIUM | Financial data access removed unexpectedly |
| `register.success` | LOW | New account created |
| `plaid.bank_linked` | LOW | Bank account connected |

### Alerts in Action

MEDIUM alert — login on locked account:

![Medium Alert](docs/screenshots/ImprovedSlackAlert.png)

HIGH alert — account deleted:

![High Alert](docs/screenshots/HighSlackAlert.png)

### Implementation

The alerting logic lives in `backend/src/utils/alert.js`. It is:
- **Non-blocking** — `fetch()` with no `await`, errors caught silently so a failed webhook never affects the user response
- **Opt-in** — if `N8N_WEBHOOK_URL` is not set, the function returns immediately with no side effects
- **Throttle state is in-memory** — resets on server restart, which is intentional (a fresh deploy clears stale throttle state)
