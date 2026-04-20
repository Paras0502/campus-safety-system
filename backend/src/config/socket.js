import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { saveLocationService } from "../services/trackingService.js";
import { triggerSOSService } from "../services/sosService.js";

let io;

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
            socket.user = decoded; // Contains id, uid, role

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
        console.log(`🔥 SOCKET CONNECTED: ${socket.user?.id} (Role: ${socket.user?.role})`);

        // ✅ JOIN ROOMS
        if (socket.user?.role) {
            socket.join(socket.user.role);
        }
        socket.join(`user:${socket.user.id}`);

        /**
         * 🚨 SOS TRIGGER (Client → Server WS path)
         * Allows triggering an SOS event entirely through WS instead of HTTP if desired
         */
        socket.on("sos:trigger", async (data) => {
            console.log("🚨 SOS TRIGGER RECEIVED OVER SOCKET:", data);
            try {
                const { location } = data;
                if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                     return;
                }
                await triggerSOSService(socket.user, location);
            } catch (error) {
                console.error("❌ socket.on('sos:trigger') error:", error);
            }
        });

        /**
         * 📍 LOCATION UPDATE (Client → Server)
         */
        socket.on("location:update", async (data) => {
            // Uncomment to debug stream: console.log("📍 LOCATION UPDATE RECEIVED:", data);

            try {
                const { caseId, lat, lng } = data;

                if (!caseId || lat === undefined || lng === undefined) {
                    console.log("❌ INVALID LOCATION DATA");
                    return;
                }

                /**
                 * 📡 REAL-TIME BROADCAST (Server → Clients)
                 */
                // Send stream directly to assigned patrols/admins via rooms instead of global!
                io.to("admin").to("patrol").to(caseId).emit("location:stream", {
                    caseId,
                    userId: socket.user.id,
                    lat,
                    lng,
                });

                /**
                 * 💾 THROTTLED DB STORAGE via trackingService
                 */
                await saveLocationService(socket.user.id, caseId, lat, lng, 5); // 5 sec throttle

            } catch (error) {
                console.error("❌ Location socket error:", error);
            }
        });

        /**
         * 🤝 JOIN CASE ROOM (Client requests to subscribe to a specific case)
         */
        socket.on("case:join", (caseId) => {
             if (caseId) {
                 socket.join(caseId);
                 console.log(`👤 User ${socket.user.id} joined case room: ${caseId}`);
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