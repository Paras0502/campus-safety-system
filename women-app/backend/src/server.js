import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initIO } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // ✅ Connect DB
        await connectDB();

        // ✅ Create HTTP server (REQUIRED for Socket.IO)
        const server = http.createServer(app);

        // ✅ Initialize Socket.IO
        const io = initIO(server);

        // ✅ Socket connection logs
        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        // ✅ Start server
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    }
};

startServer();