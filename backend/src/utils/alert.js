import logger from "./logger.js";

const SEVERITY = {
  "login.failed":             "MEDIUM",
  "login.account_locked":     "HIGH",
  "login.locked":             "MEDIUM",
  "auth.invalid_token":       "HIGH",
  "rate_limit.auth":          "HIGH",
  "password.reset.requested": "MEDIUM",
  "password.reset.completed": "MEDIUM",
  "password.changed":         "MEDIUM",
  "account.deleted":          "HIGH",
  "data.export":              "MEDIUM",
  "plaid.bank_linked":        "LOW",
  "plaid.bank_unlinked":      "MEDIUM",
  "register.success":         "LOW",
};

// Throttle window per event+IP for MEDIUM alerts — prevents alert fatigue
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes
const throttleCache = new Map();

const isThrottled = (event, ip) => {
  const key = `${event}:${ip}`;
  const last = throttleCache.get(key);
  if (last && Date.now() - last < THROTTLE_MS) return true;
  throttleCache.set(key, Date.now());
  return false;
};

export const sendAlert = (event, userId, ip) => {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;

  const severity = SEVERITY[event] || "INFO";

  // LOW events are logged by Winston only — never sent to Slack
  if (severity === "LOW") return;

  // MEDIUM events are throttled per event+IP to prevent noise
  if (severity === "MEDIUM" && isThrottled(event, ip)) return;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      severity,
      userId: userId || "unknown",
      ip: ip || "unknown",
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => logger.error("alert.send_failed", { error: err.message }));
};
