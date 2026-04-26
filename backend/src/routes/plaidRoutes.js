import express from "express";
import {
  createLinkToken,
  exchangePublicToken,
  getAuth,
  getBalance,
  getInstitution,
  getPlaidTransactions,
  syncTransactions,
  removePlaidLink,
} from "../controllers/plaidController.js";
import { protect } from "../middleware/authMiddleware.js";
import { plaidLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);

router.post("/create_link_token", createLinkToken);
router.post("/exchange_public_token", exchangePublicToken);
router.post("/auth", getAuth);
router.get("/balance", getBalance);
router.post("/institution", getInstitution);
router.post("/transactions", getPlaidTransactions);
router.post("/sync", plaidLimiter, syncTransactions);
router.delete("/unlink", removePlaidLink);

export default router;
