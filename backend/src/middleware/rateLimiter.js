import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

const json429 = (req, res) =>
  res.status(429).json({
    success: false,
    message: "Too many requests — please try again later.",
  });

// In development all traffic comes from 127.0.0.1, so skip limiting entirely
const skipInDev = () => isDev;

// Global: 500 requests per 15 min per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

// Auth endpoints: 30 attempts per 15 min per IP (login / register / refresh)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

// Plaid sync: 100 per 15 min (API cost protection)
export const plaidLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});
