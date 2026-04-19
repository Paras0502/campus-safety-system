import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Location from "../models/Location.js";

let io;

// 🧠 In-memory tracker for throttling DB writes
const lastSavedLocation = new Map();

export const initIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // ✅ FIXED
            methods: ["GET", "POST", "PATCH"],
        },
    });

    /**
     * 🔐 Socket Authentication Middleware
     */
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                console.log("❌ No token provided");
                return next(new Error("Authentication error"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;

            next();
        } catch (err) {
            console.log("❌ Token verification failed");
            next(new Error("Authentication error"));
        }
    });

    /**
     * ⚡ Connection Handler
     */
    io.on("connection", (socket) => {
        console.log("🔥 SOCKET CONNECTED:", socket.user?.id);

        /**
         * 📍 LOCATION UPDATE (Client → Server)
         */
        socket.on("location:update", async (data) => {
            console.log("📍 LOCATION UPDATE RECEIVED:", data);

            try {
                const { caseId, lat, lng } = data;

                if (!caseId || lat === undefined || lng === undefined) {
                    console.log("❌ INVALID LOCATION DATA");
                    return;
                }

                /**
                 * 📡 REAL-TIME BROADCAST (Server → Clients)
                 */
                console.log("📡 BROADCASTING location:stream");

                io.emit("location:stream", {
                    caseId,
                    lat,
                    lng,
                });

                /**
                 * 💾 THROTTLED DB STORAGE
                 */
                const key = `${socket.user.id}_${caseId}`;
                const now = Date.now();

                const lastSaved = lastSavedLocation.get(key) || 0;

                // Save every 5 seconds
                if (now - lastSaved > 5000) {
                    console.log("💾 SAVING LOCATION TO DB");

                    await Location.create({
                        userId: socket.user.id,
                        caseId,
                        coordinates: {
                            lat,
                            lng,
                        },
                        timestamp: new Date(),
                    });

                    lastSavedLocation.set(key, now);
                }

            } catch (error) {
                console.error("❌ Location socket error:", error);
            }
        });

        /**
         * ❌ Disconnect
         */
        socket.on("disconnect", () => {
            console.log("❌ SOCKET DISCONNECTED:", socket.user?.id);
        });
    });

    return io;
};

/**
 * 📡 Get IO Instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};