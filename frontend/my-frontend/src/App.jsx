import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import PatrolLayout from "./layouts/PatrolLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

import CreateReport from "./pages/CreateReport";
import MyReports from "./pages/MyReports";

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

const StudentPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6">Student Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Total Reports</h3>
        <p className="text-3xl font-black text-slate-900">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Active Alerts</h3>
        <p className="text-3xl font-black text-red-600">0</p>
      </div>
      <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold mb-1">Emergency SOS</h3>
        <p className="text-sm opacity-90 text-center">Use the floating button below in case of emergency.</p>
      </div>
    </div>
  </div>
);

const AdminPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Total Users</h3>
        <p className="text-3xl font-black text-slate-900">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Active Cases</h3>
        <p className="text-3xl font-black text-amber-600">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Resolved SOS</h3>
        <p className="text-3xl font-black text-green-600">0</p>
      </div>
    </div>
  </div>
);

const PatrolPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6">Patrol Output</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 ring-1 ring-red-50">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Active Emergencies</h3>
        <p className="text-4xl font-black text-red-600 animate-pulse">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Patrol Coverage</h3>
        <p className="text-4xl font-black text-slate-900">100%</p>
      </div>
    </div>
  </div>
);

const SuperAdminPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6">Global Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Admins</h3>
        <p className="text-3xl font-black text-slate-900">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Patrols</h3>
        <p className="text-3xl font-black text-slate-900">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Students</h3>
        <p className="text-3xl font-black text-slate-900">0</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</h3>
        <p className="text-xl font-bold text-green-400 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full"></span> Online
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const { token, role } = getAuth();
  const isAuthenticated = !!token && !!role;

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>

        {/* ✅ ROOT → ALWAYS GO TO LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔐 LOGIN */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
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
            <Route path="create-report" element={<CreateReport />} />
            <Route path="my-reports" element={<MyReports />} />
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

        {/* ❌ FALLBACK */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default App;