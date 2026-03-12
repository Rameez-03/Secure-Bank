import express from "express"
import { deleteMain, getUser, postMain, putMain } from "../controllers/mainController.js";

const router = express.Router();

router.get("/", getUser)
router.post("/", postMain)
router.put("/:id", putMain)
router.delete("/:id", deleteMain)

export default router;