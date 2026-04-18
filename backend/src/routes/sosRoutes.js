import express from "express";
import { triggerSOS, resolveSOS } from "../controllers/sosController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🚨 Trigger SOS
router.post("/trigger", authMiddleware, triggerSOS);

// ✅ Resolve SOS
router.patch("/:id/resolve", authMiddleware, allowRoles("admin", "patrol"), resolveSOS);

export default router;