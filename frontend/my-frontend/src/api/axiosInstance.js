import axios from "axios";
import { getAuth, clearAuth } from "../utils/auth";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

// 🔐 Request Interceptor: Attach token automatically
axiosInstance.interceptors.request.use(
    (config) => {
        const { token } = getAuth();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔒 Response Interceptor: Handle global errors (e.g. 401)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("🔒 Auth Error: Unauthorized access. Logging out...");
            clearAuth();
            toast.error("Session expired. Please log in again.");
            // Force redirect to login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;