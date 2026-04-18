import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import PatrolLayout from "./layouts/PatrolLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

import { getAuth } from "./utils/auth";

// 🔁 Role → Route mapping
const getRedirectPath = (role) => {
  switch (role) {
    case "student":
      return "/student";
    case "admin":
      return "/admin";
    case "patrol":
      return "/patrol";
    case "super_admin":
      return "/super-admin";
    default:
      return "/login";
  }
};

// Temporary dashboard pages
const StudentPage = () => <h1>Student Dashboard</h1>;
const AdminPage = () => <h1>Admin Dashboard</h1>;
const PatrolPage = () => <h1>Patrol Dashboard</h1>;
const SuperAdminPage = () => <h1>Super Admin Dashboard</h1>;

function App() {
  const { token, role } = getAuth();

  // ✅ Prevent redirect loop (IMPORTANT FIX)
  const isValidAuth = token && role;

  return (
    <Router>
      <Routes>

        {/* 🔐 Root Redirect */}
        <Route
          path="/"
          element={
            isValidAuth ? (
              <Navigate to={getRedirectPath(role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🔐 Login Route */}
        <Route
          path="/login"
          element={
            isValidAuth ? (
              <Navigate to={getRedirectPath(role)} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* 🔐 STUDENT */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentPage />} />
          </Route>
        </Route>

        {/* 🔐 ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "super_admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
          </Route>
        </Route>

        {/* 🔐 PATROL */}
        <Route element={<ProtectedRoute allowedRoles={["patrol"]} />}>
          <Route path="/patrol" element={<PatrolLayout />}>
            <Route index element={<PatrolPage />} />
          </Route>
        </Route>

        {/* 🔐 SUPER ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminPage />} />
          </Route>
        </Route>

        {/* ❌ Fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default App;