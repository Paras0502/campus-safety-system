import axios from "axios";
import { getAuth, setAuth, clearAuth } from "../utils/auth";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
    baseURL: "https://campus-safety-system.onrender.com/api",
    withCredentials: false, // keep this for now
});

// ─────────────────────────────────────────────
// 🔐 REQUEST INTERCEPTOR: Attach JWT token
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 🔒 RESPONSE INTERCEPTOR: Handle 401 with token refresh
// ─────────────────────────────────────────────

// Flag to prevent infinite refresh loops
let isRefreshing = false;

// Queue of requests waiting for the new token
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 and avoid retrying the refresh call itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh")
        ) {
            if (isRefreshing) {
                // 🔄 Another request already triggered refresh — queue this one
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // 🔄 Mark this request as already retried to prevent infinite loop
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 🍪 Call refresh — cookie is sent automatically (withCredentials: true)
                const res = await axiosInstance.post("/auth/refresh");
                const { token, role, uid } = res.data.data;

                // ✅ Persist the new access token
                setAuth({ token, role, uid });

                // ✅ Update auth header on the failed request and all queued ones
                axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                processQueue(null, token);

                // ✅ Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // ❌ Refresh also failed — session is truly dead
                processQueue(refreshError, null);
                clearAuth();
                toast.error("Session expired. Please log in again.");
                window.location.href = "/login";
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;