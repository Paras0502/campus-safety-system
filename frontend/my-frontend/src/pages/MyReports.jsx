import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Clock, MapPin, ShieldAlert, Loader2, Info, CheckCircle2, Search, FileText, AlertCircle } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { getAuth } from "../utils/auth";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const socket = useSocket();
    const auth = getAuth();

    const fetchReports = async () => {
        try {
            const res = await axiosInstance.get("/reports/my");
            setReports(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();

        // 📡 Listen for status updates in real-time
        if (socket) {
            socket.on("case:update", (data) => {
                // If the update is for this student's report, refresh the list
                if (data.studentId === auth?.user?._id) {
                    fetchReports();
                }
            });
        }

        return () => {
            if (socket) socket.off("case:update");
        };
    }, [socket]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "closed":
                return { 
                    bg: "bg-green-50 text-green-700 border-green-200", 
                    label: "Closed / Resolved",
                    icon: <CheckCircle2 size={14} />
                };
            case "action_taken":
                return { 
                    bg: "bg-blue-50 text-blue-700 border-blue-200", 
                    label: "Action Taken",
                    icon: <AlertCircle size={14} />
                };
            case "investigating":
                return { 
                    bg: "bg-purple-50 text-purple-700 border-purple-200", 
                    label: "Investigating",
                    icon: <Search size={14} />
                };
            case "under_review":
                return { 
                    bg: "bg-amber-50 text-amber-700 border-amber-200", 
                    label: "Under Review",
                    icon: <FileText size={14} />
                };
            case "submitted":
                return { 
                    bg: "bg-slate-50 text-slate-600 border-slate-200", 
                    label: "Submitted",
                    icon: <Clock size={14} />
                };
            default:
                return { 
                    bg: "bg-slate-50 text-slate-500 border-slate-100", 
                    label: status || "Pending",
                    icon: <Clock size={14} />
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin w-10 h-10 mb-4 text-red-500" />
                <p className="font-medium">Syncing your reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center max-w-2xl mx-auto mt-8">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-800 mb-2">Notice</h3>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Safety Reports</h2>
                    <p className="text-slate-500 mt-1 font-medium">Real-time status of your active and past submissions.</p>
                </div>
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Submissions</span>
                        <span className="text-2xl font-black">{reports.length}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-700"></div>
                    <div className="bg-green-500/20 p-2 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-green-400" />
                    </div>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-100 p-6 rounded-full mb-6">
                        <Info className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">No Reports Yet</h3>
                    <p className="text-slate-500 max-w-md font-medium">Your reported incidents will appear here once you file them using the SOS button or Report Form.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => {
                        const style = getStatusStyle(report.status);
                        return (
                            <div key={report._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border-b-4 border-b-slate-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${style.bg} font-black text-[10px] uppercase tracking-wider`}>
                                        {style.icon}
                                        {style.label}
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                                    {report.incidentType || "Anonymous Report"}
                                </h3>
                                
                                <p className="text-slate-500 text-sm mb-8 flex-grow font-medium leading-relaxed">
                                    {report.description}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                                            <MapPin size={14} className="text-slate-400" />
                                        </div>
                                        <span className="truncate italic">{report.location?.address || "Location Pending"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                        <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center">
                                            <Clock size={14} className="text-slate-300" />
                                        </div>
                                        <span>{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
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