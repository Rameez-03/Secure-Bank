import dns from "dns";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";

// Force Google / Cloudflare DNS resolvers — Virgin Media blocks Node c-ares on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import plaidRoutes from "./routes/plaidRoutes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import logger from "./utils/logger.js";

dotenv.config();

// Fail hard if critical secrets are missing at startup
const REQUIRED_ENV = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI"];
const WARN_ENV = ["PLAID_CLIENT_ID", "PLAID_SECRET", "ENCRYPTION_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.error("startup.missing_required_env", { key });
    process.exit(1);
  }
}
for (const key of WARN_ENV) {
  if (!process.env[key]) {
    logger.warn("startup.missing_recommended_env", { key });
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Trust reverse proxy only in production (prevents IP spoofing in local/dev environments)
if (isProd) app.set("trust proxy", 1);

// HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// CORS — strict allowed origins only
const allowedOrigins = isProd
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server requests with no origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Cookie parser (required for httpOnly refresh token)
app.use(cookieParser());

// Body parsers with size limits to prevent payload attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Sanitize MongoDB operators in req.body / req.query / req.params
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Global rate limiter
app.use(globalLimiter);

// Request logger (method + path only — no sensitive data)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== "test") {
    logger.info("http.request", { method: req.method, path: req.path, ip: req.ip });
  }
  next();
});

// ==========================================
// ROUTES
// ==========================================

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/plaid", plaidRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — never leak stack traces to client
app.use((err, _req, res, _next) => {
  logger.error("server.unhandled_error", { error: err.message, stack: err.stack, status: err.statusCode });
  const status = err.statusCode || 500;
  const message = isProd && status === 500 ? "Internal server error" : err.message || "Internal server error";
  res.status(status).json({ success: false, message });
});

// ==========================================
// DATABASE & SERVER START
// ==========================================

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("startup.db_connected");

    app.listen(PORT, () => {
      logger.info("startup.server_ready", { port: PORT, env: process.env.NODE_ENV || "development" });
    });
  } catch (error) {
    logger.error("startup.failed", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  logger.error("process.uncaught_exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("process.unhandled_rejection", { error: error?.message, stack: error?.stack });
  process.exit(1);
});

startServer();

export default app;
