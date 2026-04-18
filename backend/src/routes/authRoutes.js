import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register
router.post("/register", registerUser);

// ✅ Login
router.post("/login", loginUser);

// 🔐 Protected Test Route
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user,
    });
});

export default router;