import { io } from "socket.io-client";

let socket = null;

/**
 * 🔌 Get or create socket instance (singleton)
 */
export const getSocket = () => {
    if (!socket) {
        socket = io("http://localhost:5000", {
            auth: {
                token: localStorage.getItem("token"),
            },

            // 🔄 Reconnection config
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,

            // Optional tuning
            transports: ["websocket"],
        });

        /**
         * 🔌 Connection logs (debugging)
         */
        socket.on("connect", () => {
            console.log("🔌 Socket connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("❌ Socket disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
        });
    }

    return socket;
};