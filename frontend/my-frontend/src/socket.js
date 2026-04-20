import { io } from "socket.io-client";

let socket = null;

/**
 * 🔌 Get or create socket instance (singleton)
 * Returns the current socket, or creates a new one lazily.
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

            // Prefer WebSocket transport
            transports: ["websocket"],

            // Don't auto-connect — we connect manually via connectSocket()
            autoConnect: false,
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

/**
 * 🔌 Initialize and connect the socket with a given JWT token.
 * Call this once after a successful login.
 * @param {string} token - JWT access token
 */
export const connectSocket = (token) => {
    const s = getSocket();

    // Update the auth token before connecting
    s.auth = { token };

    if (!s.connected) {
        s.connect();
        console.log("🔌 Socket connecting with fresh token...");
    }
};

/**
 * 🔌 Disconnect and destroy the socket instance (call on logout)
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔌 Socket disconnected and cleared.");
    }
};