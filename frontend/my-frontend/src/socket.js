import { io } from "socket.io-client";

const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("⚠️ No token found in localStorage");
    }

    return token;
};

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    autoConnect: false, // Prevent connecting before token is available
});

// Helper to manually connect after login or on app load
export const connectSocket = (token) => {
    if (!token) return;
    
    if (socket.connected) {
        // Reconnect if token changes
        if (socket.auth?.token !== token) {
            socket.disconnect();
        } else {
            return;
        }
    }
    
    socket.auth = { token };
    socket.connect();
};

export default socket;