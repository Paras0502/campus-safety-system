import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext"; // Assuming a SocketContext exists from Phase 5/7

const STATUS_ORDER = [
    "submitted",
    "under_review",
    "investigating",
    "action_taken",
    "closed",
];

const CaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [patrolIdInput, setPatrolIdInput] = useState("");

    const fetchCase = async () => {
        try {
            const res = await api.get(`/admin/cases/${id}`);
            setCaseData(res.data.data);
        } catch (error) {
            toast.error("Failed to load case details");
            navigate("/admin/cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchCase(); 
        
        // 📡 Real-time Sync Integration (Step 6)
        if (socket) {
            socket.on("case:update", (data) => {
                if (data.caseId === id) {
                    toast.success("Case updated remotely");
                    fetchCase();
                }
            });
        }

        return () => {
            if (socket) socket.off("case:update");
        };
    }, [id, socket]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`/admin/cases/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchCase();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleAssignPatrol = async (e) => {
        e.preventDefault();
        try {
            const patrolIds = patrolIdInput.split(",").map(i => i.trim()).filter(i => i);
            await api.patch(`/admin/cases/${id}/assign`, { patrolIds });
            toast.success("Patrol assigned successfully");
            setPatrolIdInput("");
            fetchCase();
        } catch (error) {
            toast.error("Failed to assign patrol");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading case details...</div>;
    if (!caseData) return null;

    const currentStatusIndex = STATUS_ORDER.indexOf(caseData.status);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Case Details</h2>
                        <p className="text-slate-500 font-mono text-sm mt-1">{caseData._id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200`}>
                        {caseData.status.replace("_", " ")}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Type</span>
                        <span className="text-lg font-bold text-slate-800 capitalize">{caseData.type}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Priority</span>
                        <span className="text-lg font-bold text-slate-800 capitalize">{caseData.priority}</span>
                    </div>
                </div>
            </div>

            {/* Workflow Board */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                    Workflow Enforcement
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative">
                    {STATUS_ORDER.map((s, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const isNext = index === currentStatusIndex + 1;

                        return (
                            <div key={s} className="flex-1 w-full flex flex-col items-center gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(s)}
                                    disabled={!isNext}
                                    className={`w-full py-3 px-4 rounded-xl font-bold transition text-xs uppercase tracking-tighter
                                        ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200' : 
                                          isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                                          isNext ? 'bg-white text-slate-600 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600' : 
                                          'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}`}
                                >
                                    {s.replace("_", " ")}
                                </button>
                                {index < STATUS_ORDER.length - 1 && (
                                    <div className="hidden md:block absolute h-[2px] bg-slate-100 -z-10" style={{ width: '15%', left: `${index * 20 + 15}%` }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-400 mt-6 text-center italic">
                    Sequential workflow enforced. You can only move to the next status.
                </p>
            </div>

            {/* Management Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignment Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Assign Patrol Units</h3>
                    <form onSubmit={handleAssignPatrol} className="flex gap-2">
                        <input 
                            type="text"
                            placeholder="Enter Patrol User ID..."
                            className="flex-1 p-2 border border-slate-300 rounded font-mono text-sm"
                            value={patrolIdInput}
                            onChange={(e) => setPatrolIdInput(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-slate-800 text-white font-bold px-4 py-2 rounded hover:bg-slate-900 transition text-sm">
                            Assign
                        </button>
                    </form>
                    
                    <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Currently Assigned</h4>
                        {caseData.assignedPatrols.length === 0 ? (
                            <p className="text-sm text-slate-400">No patrols assigned yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {caseData.assignedPatrols.map(p => (
                                    <li key={p._id} className="text-sm bg-slate-50 p-2 rounded border border-slate-100 font-medium text-slate-700 flex justify-between">
                                        <span>{p.name}</span>
                                        <span className="text-slate-400 text-xs font-mono">{p.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Report Info Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Linked Report</h3>
                    {caseData.reportId ? (
                        <div className="space-y-3">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Incident Type</span>
                                <p className="text-sm font-bold text-slate-700">{caseData.reportId.incidentType || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Description</span>
                                <p className="text-sm text-slate-600 line-clamp-3">{caseData.reportId.description}</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/admin/reports/${caseData.reportId._id || caseData.reportId}`)}
                                className="text-blue-600 text-xs font-bold hover:underline"
                            >
                                View Full Report →
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No report linked (SOS triggered?)</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
