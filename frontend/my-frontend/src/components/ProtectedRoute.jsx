import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles }) => {
    const { token, role } = getAuth();

    // ❌ Not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Role not allowed
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Authorized
    return <Outlet />;
};

export default ProtectedRoute;