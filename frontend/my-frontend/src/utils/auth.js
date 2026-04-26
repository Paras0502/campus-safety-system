// src/utils/auth.js

// 🔐 Save auth data
export const setAuth = ({ token, role, uid }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("uid", uid);
};

// 📦 Get auth data
export const getAuth = () => {
    return {
        token: localStorage.getItem("token"),
        role: localStorage.getItem("role"),
        uid: localStorage.getItem("uid"),
    };
};

// 🚪 Logout
export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("uid");
};

// ✅ Check if logged in
export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};