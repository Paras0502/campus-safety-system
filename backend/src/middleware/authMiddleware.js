import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 🔒 Check token existence
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        // 🔑 Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 IMPORTANT: Fetch full user from DB
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Attach full user object
        req.user = user;

        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

export default authMiddleware;