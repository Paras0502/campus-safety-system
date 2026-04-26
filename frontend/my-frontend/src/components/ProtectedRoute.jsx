import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // ❌ Not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Wrong role
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Allow nested routes
    return <Outlet />;
};

export default ProtectedRoute;