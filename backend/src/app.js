import express from "express";
import cors from "cors";

// Route placeholders (will be used in Phase 1)
import authRoutes from "./routes/authRoutes.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ✅ Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ API Routes
app.use("/api/auth", authRoutes);

// ✅ Global Error Handler (must be last)
app.use(errorHandler);

export default app;