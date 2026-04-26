import express from "express";
import { updateLocation } from "../controllers/locationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Fallback location API
router.post("/update", authMiddleware, updateLocation);

export default router;