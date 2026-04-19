import axios from "axios";
import { getAuth, clearAuth } from "./utils/auth";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, // For cookies if needed
});

// Request Interceptor: Attach token automatically
api.interceptors.request.use((config) => {
    const { token } = getAuth();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        console.error("🔒 Auth Error: Unauthorized access. Logging out...");
        clearAuth();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
    }
    return Promise.reject(error);
});

export default api;
