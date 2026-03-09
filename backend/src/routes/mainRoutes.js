import express from "express"
import { deleteMain, getMain, postMain, putMain } from "../controllers/mainController.js";

const router = express.Router();

router.get("/", getMain)
router.post("/", postMain)
router.put("/:id", putMain)
router.delete("/:id", deleteMain)

export default router;