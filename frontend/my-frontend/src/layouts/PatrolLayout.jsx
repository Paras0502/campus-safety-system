import { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { getSocket } from "../socket";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import { LogOut, Navigation } from "lucide-react";

const PatrolLayout = () => {
    const navigate = useNavigate();
    const { uid } = getAuth();

    useEffect(() => {
        const socket = getSocket();
        socket.on("sos:alert", (data) => {
            toast.error(`🚨 ALERT: SOS from User: ${data.uid}`, { duration: 10000 });
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
            <aside className="w-64 bg-amber-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 text-xl font-bold border-b border-amber-800 tracking-wide flex items-center gap-2">
                    <Navigation className="text-white" />
                    <span>PARAS<span className="text-amber-300"> PATROL</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/patrol" className="block px-4 py-3 text-amber-100 font-medium rounded transition bg-amber-800 hover:bg-amber-700">
                        Dashboard
                    </Link>
                    <Link to="/patrol/active-alerts" className="block px-4 py-3 text-amber-100 font-medium rounded transition hover:bg-amber-800">
                        Active Alerts
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <h1 className="text-2xl font-semibold text-slate-800">Patrol Dashboard</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Patrol</span>
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

export default PatrolLayout;