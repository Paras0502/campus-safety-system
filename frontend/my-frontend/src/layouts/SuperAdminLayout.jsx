import { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import socket from "../socket";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import { LogOut, LayoutGrid } from "lucide-react";

const SuperAdminLayout = () => {
    const navigate = useNavigate();
    const { uid } = getAuth();

    useEffect(() => {
        socket.on("sos:alert", (data) => {
            toast.error(`🚨 EMERGENCY SOS from User: ${data.uid}`, { duration: 10000 });
        });

        return () => {
            socket.off("sos:alert");
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("uid");
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-violet-950 text-white flex flex-col hidden md:flex">
                <div className="p-6 text-xl font-bold border-b border-violet-900 tracking-wide flex items-center gap-2">
                    <LayoutGrid className="text-white" />
                    <span>PARAS<span className="text-violet-300"> GLOBAL</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/super-admin" className="block px-4 py-3 text-violet-100 font-medium rounded transition bg-violet-900 hover:bg-violet-800">
                        System Dashboard
                    </Link>
                    <Link to="/super-admin/settings" className="block px-4 py-3 text-violet-100 font-medium rounded transition hover:bg-violet-900">
                        Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <h1 className="text-2xl font-semibold text-slate-800">Global Overview</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Super Admin</span>
                            <span className="text-sm font-bold text-slate-800">
                                UID: {uid || "Unknown"}
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded shadow-sm hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;