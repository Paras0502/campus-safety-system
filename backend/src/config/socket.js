import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { saveLocationService, emitLocation } from "../services/trackingService.js";
import { triggerSOSService } from "../services/sosService.js";

let io;

/**
 * 🔁 Helper: Join base rooms
 */
const joinBaseRooms = (socket) => {
    // User-specific room
    socket.join(`user:${socket.user.id}`);

    // Role-based rooms
    if (socket.user.role === "admin") {
        socket.join("admin");
    } else if (socket.user.role === "patrol") {
        socket.join("patrol");
    }
};

/**
 * 🚀 Initialize Socket.IO
 */
export const initIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PATCH"],
        },
    });

    /**
     * 🔐 AUTH MIDDLEWARE
     */
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1];

            if (!token) {
                return next(new Error("Authentication error: No token"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded?.id || !decoded?.role) {
                return next(new Error("Authentication error: Invalid payload"));
            }

            socket.user = {
                id: decoded.id,
                role: decoded.role,
                uid: decoded.uid,
            };

            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    /**
     * ⚡ CONNECTION HANDLER
     */
    io.on("connection", (socket) => {
        console.log(`🔥 CONNECTED: ${socket.user.id} (${socket.user.role})`);

        // Join base rooms
        joinBaseRooms(socket);

        /**
         * 🔄 Rejoin case rooms after reconnect
         */
        socket.on("cases:rejoin", (caseIds = []) => {
            if (!Array.isArray(caseIds)) return;

            caseIds.forEach((caseId) => {
                if (caseId) socket.join(`case:${caseId}`);
            });

            console.log(`🔄 ${socket.user.id} rejoined cases:`, caseIds);
        });

        /**
         * 🚨 SOS TRIGGER
         */
        socket.on("sos:trigger", async ({ location }) => {
            try {
                if (socket.user.role !== "student") return;

                if (
                    !location ||
                    typeof location.lat !== "number" ||
                    typeof location.lng !== "number"
                ) {
                    return;
                }

                await triggerSOSService(socket.user, location);
            } catch (err) {
                console.error("❌ SOS socket error:", err.message);
            }
        });

        /**
         * 📍 LOCATION UPDATE
         */
        socket.on("location:update", async ({ caseId, lat, lng }) => {
            try {
                if (!caseId || lat == null || lng == null) return;

                if (!["student", "patrol"].includes(socket.user.role)) return;

                const payload = {
                    caseId,
                    lat,
                    lng,
                    userId: socket.user.id,
                    timestamp: Date.now(),
                };

                // Emit to case room
                emitLocation(caseId, payload);

                // Save with throttle + jitter control
                await saveLocationService(
                    socket.user.id,
                    caseId,
                    lat,
                    lng,
                    3
                );
            } catch (error) {
                console.error("❌ Location socket error:", error);
            }
        });

        /**
         * ❌ DISCONNECT
         */
        socket.on("disconnect", () => {
            console.log(`❌ DISCONNECTED: ${socket.user.id}`);
        });
    });

    return io;
};

/**
 * 📡 Get IO Instance
 */
export const getIO = () => {
    if (!io) throw new Error("Socket.IO not initialized!");
    return io;
};