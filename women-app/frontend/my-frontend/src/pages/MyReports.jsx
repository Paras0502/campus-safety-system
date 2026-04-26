import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getMyReports } from "../api/reportService";
import { useSocket } from "../context/SocketContext";
import { getAuth } from "../utils/auth";
import { 
    Clock, 
    MapPin, 
    ShieldAlert, 
    Loader2, 
    Info, 
    CheckCircle2, 
    Search, 
    FileText, 
    AlertCircle,
    ArrowRight
} from "lucide-react";

/**
 * @desc Student Dashboard: Track self-submitted reports and their real-time status
 */
const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const socket = useSocket();
    const auth = getAuth();

    const fetchReports = async () => {
        try {
            const data = await getMyReports();
            setReports(data || []);
        } catch (err) {
            console.error(err);
            setError("Connectivity issue: Could not fetch report history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();

        // 📡 Real-time Sync (Phase 8 Objective)
        if (socket) {
            socket.on("case:update", (data) => {
                // If the update involves this specific student's report
                if (data.studentId === auth?.uid) {
                    fetchReports();
                }
            });
        }

        return () => {
            if (socket) socket.off("case:update");
        };
    }, [socket, auth?.uid]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "closed":
                return { 
                    bg: "bg-green-100 text-green-800 border-green-200", 
                    label: "Case Closed",
                    icon: <CheckCircle2 size={12} />,
                    progress: 100
                };
            case "action_taken":
                return { 
                    bg: "bg-blue-100 text-blue-800 border-blue-200", 
                    label: "Action Taken",
                    icon: <ShieldAlert size={12} />,
                    progress: 80
                };
            case "investigating":
                return { 
                    bg: "bg-purple-100 text-purple-800 border-purple-200", 
                    label: "Investigating",
                    icon: <Search size={12} />,
                    progress: 60
                };
            case "under_review":
                return { 
                    bg: "bg-amber-100 text-amber-800 border-amber-200", 
                    label: "Under Review",
                    icon: <FileText size={12} />,
                    progress: 40
                };
            case "submitted":
                return { 
                    bg: "bg-slate-100 text-slate-700 border-slate-200", 
                    label: "Submitted",
                    icon: <Clock size={12} />,
                    progress: 20
                };
            default:
                return { 
                    bg: "bg-slate-50 text-slate-500 border-slate-100", 
                    label: status || "Pending",
                    icon: <Clock size={12} />,
                    progress: 0
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
                <Loader2 className="animate-spin text-red-600" size={40} />
                <p className="font-black uppercase tracking-widest text-xs">Accessing Secure Records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-10 bg-white rounded-[32px] border border-red-100 shadow-2xl shadow-red-50 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">System Error</h3>
                <p className="text-slate-500 font-medium mb-8">{error}</p>
                <button onClick={fetchReports} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">My Activity</h2>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live status monitoring for your reported incidents.
                    </p>
                </div>
                <div className="bg-slate-900 p-8 rounded-[32px] text-white flex items-center gap-8 shadow-2xl shadow-slate-200 border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Logs</span>
                        <span className="text-4xl font-black tabular-nums">{reports.length}</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {reports.length === 0 ? (
                <div className="bg-white border-4 border-dashed border-slate-100 p-32 rounded-[48px] flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-10 rounded-full mb-8">
                        <Info className="w-16 h-16 text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Everything is Quiet</h3>
                    <p className="text-slate-400 max-w-md font-bold text-sm leading-relaxed">
                        You haven't submitted any incident reports. If you find yourself in an unsafe situation, use the emergency SOS immediately.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {reports.map((report) => {
                        const style = getStatusStyle(report.status);
                        return (
                            <div key={report._id} className="group bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full border-b-8 border-b-slate-50 overflow-hidden relative">
                                {/* Status Indicator Layer */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-100">
                                        <AlertTriangle size={18} className="text-red-500" />
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${style.bg} font-black text-[10px] uppercase tracking-widest shadow-sm`}>
                                        {style.icon}
                                        {style.label}
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                                    {report.incidentType || "Anonymous Log"}
                                </h3>
                                
                                <p className="text-slate-500 text-sm mb-10 flex-grow font-bold leading-relaxed line-clamp-4">
                                    {report.description}
                                </p>
                                
                                <div className="space-y-6 pt-8 border-t border-slate-50">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                            <span>Workflow Recovery</span>
                                            <span>{style.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                                                style={{ width: `${style.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-black uppercase tracking-tighter">
                                            <MapPin size={14} className="text-slate-300" />
                                            <span className="truncate">{report.location?.address || "Coordinates Logged"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <Clock size={12} className="text-slate-200" />
                                            <span>{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-[20px] bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                        View Log Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyReports;