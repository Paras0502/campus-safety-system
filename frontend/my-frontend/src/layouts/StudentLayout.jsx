import { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import SOSButton from "../components/SOSButton";
import { getSocket } from "../socket";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

const StudentLayout = () => {
    const navigate = useNavigate();
    const { uid } = getAuth();

    useEffect(() => {
        const socket = getSocket();
        socket.on("sos:alert", (data) => {
            console.log("🚨 SOS Alert Received:", data);
            toast.error(`🚨 SOS Alert from User: ${data.uid}`, { duration: 5000 });
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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 text-xl font-bold border-b border-slate-800 tracking-wide text-red-500">
                    PARAS<span className="text-white"> SAFETY</span>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/student" className="block px-4 py-3 text-slate-300 font-medium rounded transition bg-slate-800 hover:bg-slate-700">
                        Dashboard
                    </Link>
                    <Link to="/student/my-reports" className="block px-4 py-3 text-slate-300 font-medium rounded transition hover:bg-slate-800">
                        My Reports
                    </Link>
                    <Link to="/student/create-report" className="block px-4 py-3 text-slate-300 font-medium rounded transition hover:bg-slate-800">
                        Create Report
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <h1 className="text-2xl font-semibold text-gray-800">Student Dashboard</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged in</span>
                            <span className="text-sm font-bold text-gray-800">
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

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <Outlet />
                </main>
            </div>

            {/* Floating SOS Button */}
            <SOSButton />
        </div>
    );
};

export default StudentLayout;