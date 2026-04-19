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
    auth: {
        token: getToken(), // ✅ IMPORTANT FIX
    },
});

export default socket;