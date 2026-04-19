import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCases } from "../api/caseService";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

/**
 * @desc Admin Dashboard: List all reported cases and SOS events
 */
const AdminCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchCases = async () => {
        try {
            const data = await getAllCases();
            setCases(data.data);
        } catch (error) {
            console.error("Error fetching cases:", error);
            toast.error("Failed to load cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();

        // 📡 Real-time Sync (Step 6/7)
        if (socket) {
            socket.on("case:update", (updatedCase) => {
                setCases((prev) => 
                    prev.map((c) => (c._id === updatedCase.caseId ? { ...c, status: updatedCase.status } : c))
                );
                // Optionally refresh if new cases might have been added
                // fetchCases(); 
            });

            // Listen for new SOS alerts (if we want to refresh list)
            socket.on("sos:alert", () => {
                fetchCases();
            });
        }

        return () => {
            if (socket) {
                socket.off("case:update");
                socket.off("sos:alert");
            }
        };
    }, [socket]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "submitted": return "bg-slate-100 text-slate-700 border-slate-200";
            case "under_review": return "bg-amber-100 text-amber-700 border-amber-200";
            case "investigating": return "bg-purple-100 text-purple-700 border-purple-200";
            case "action_taken": return "bg-blue-100 text-blue-700 border-blue-200";
            case "closed": return "bg-green-100 text-green-700 border-green-200";
            default: return "bg-slate-50 text-slate-400";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 text-slate-400 font-bold animate-pulse">
                <Clock className="mr-2 animate-spin" /> Syncing Case Records...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Case Management</h2>
                    <p className="text-slate-500 font-medium">Monitor and manage all campus safety incidents.</p>
                </div>
                <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                    {cases.length} Total Incidents
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="p-6">Status</th>
                                <th className="p-6">Type / Priority</th>
                                <th className="p-6">Incident ID / Date</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cases.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-300 font-bold italic">
                                        No security incidents recorded.
                                    </td>
                                </tr>
                            ) : (
                                cases.map((c) => (
                                    <tr key={c._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyle(c.status)} text-[10px] font-black uppercase tracking-wider shadow-sm`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'closed' ? 'bg-green-500' : 'bg-current animate-pulse'}`}></div>
                                                {c.status.replace("_", " ")}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-black uppercase tracking-tighter ${c.type === 'sos' ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {c.type === 'sos' ? '🚨 SOS Alert' : '📄 Report'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${c.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                                    {c.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-mono font-bold text-slate-800">#{c._id.substring(c._id.length - 8).toUpperCase()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Link 
                                                to={`/admin/cases/${c._id}`} 
                                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-slate-200 hover:shadow-red-200"
                                            >
                                                Details <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCases;
