import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load env variables
dotenv.config();

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});