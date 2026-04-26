import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js"; // ✅ FIXED
import sosRoutes from "./routes/sosRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

import cors from "cors";

import express from "express";
import cors from "cors";

const app = express();

// 👇 PASTE YOUR CORS CODE RIGHT HERE
const allowedOrigins = [
  "https://campus-women-security.netlify.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes("netlify.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// 👇 keep this AFTER cors
app.use(express.json());

// routes...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("API is running...");
});



app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;