import express from "express";
import {
  createLinkToken,
  exchangePublicToken,
  getAuth,
  getBalance,
  getInstitution,
  getPlaidTransactions,
  syncTransactions,
  removePlaidLink
} from "../controllers/plaidController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All Plaid routes require authentication
router.use(protect);

// Create Link Token (first step to connect bank)
router.post("/create_link_token", createLinkToken);

// Exchange public token for access token (after user connects bank)
router.post("/exchange_public_token", exchangePublicToken);

// Get account and routing numbers
router.post("/auth", getAuth);

// Get account balance
router.get("/balance", getBalance);

// Get institution details
router.post("/institution", getInstitution);

// Get transactions from Plaid
router.post("/transactions", getPlaidTransactions);

// Sync Plaid transactions to database
router.post("/sync", syncTransactions);

// Unlink bank account
router.delete("/unlink", removePlaidLink);

export default router;