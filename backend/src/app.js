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

app.use(cors({
    origin: "https://69ee4c34e043a463623ad11b--campus-women-security.netlify.app/login",
    credentials: true,
}));
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