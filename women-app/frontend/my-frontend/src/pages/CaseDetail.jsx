import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCaseById, updateCaseStatus, assignCase } from "../api/caseService";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import {
    Clock,
    Shield,
    User,
    FileText,
    AlertCircle,
    CheckCircle2,
    Activity,
    ArrowLeft,
    Plus
} from "lucide-react";

const STATUS_ORDER = [
    "submitted",
    "under_review",
    "investigating",
    "action_taken",
    "closed",
];

/**
 * @desc Case Detail View: Manage workflow transitions and patrol assignments
 */
const CaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [patrolIdInput, setPatrolIdInput] = useState("");

    const fetchCaseDetails = async () => {
        try {
            const data = await getCaseById(id);
            setCaseData(data.data);
        } catch (error) {
            toast.error("Failed to load case details");
            navigate("/admin/cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaseDetails();

        // 📡 Real-time Sync Integration
        if (socket) {
            socket.on("case:update", (data) => {
                if (data.caseId === id) {
                    toast.success("Remote update received");
                    fetchCaseDetails();
                }
            });
        }

        return () => {
            if (socket) socket.off("case:update");
        };
    }, [id, socket]);

    const handleStatusTransition = async (newStatus) => {
        try {
            await updateCaseStatus(id, newStatus);
            toast.success(`Transitioned to ${newStatus.replace("_", " ")}`);
            fetchCaseDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Workflow violation");
        }
    };

    const handlePatrolAssignment = async (e) => {
        e.preventDefault();
        try {
            const patrolIds = patrolIdInput.split(",").map(i => i.trim()).filter(i => i);
            await assignCase(id, { patrolIds });
            toast.success("Patrol units attached");
            setPatrolIdInput("");
            fetchCaseDetails();
        } catch (error) {
            toast.error("Assignment failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Activity className="animate-spin text-red-500" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Synchronizing Data...</p>
        </div>
    );

    if (!caseData) return null;

    const currentStatusIndex = STATUS_ORDER.indexOf(caseData.status);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition font-bold text-sm uppercase tracking-wider"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <div className="flex gap-2">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${caseData.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        Priority: {caseData.priority}
                    </span>
                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-200 capitalize">
                        ID: {caseData._id.substring(caseData._id.length - 8)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Case Overview & Workflow */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Card */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                        <div className="flex flex-col gap-1 mb-8">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none capitalize">
                                {caseData.type} Investigation
                            </h2>
                            <p className="text-slate-400 text-sm font-bold flex items-center gap-2 mt-2">
                                <Clock size={14} /> Created {new Date(caseData.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {/* Workflow Board */}
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Shield size={120} />
                            </div>

                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Activity size={14} className="text-blue-600" />
                                Sequential Workflow Status
                            </h3>

                            <div className="flex flex-col md:flex-row gap-2 relative">
                                {STATUS_ORDER.map((s, index) => {
                                    const isCompleted = index < currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;
                                    const isNext = index === currentStatusIndex + 1;

                                    return (
                                        <div key={s} className="flex-1 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleStatusTransition(s)}
                                                disabled={!isNext}
                                                className={`w-full py-4 px-3 rounded-2xl font-black transition-all text-[9px] uppercase tracking-wider border-2
                                                    ${isCompleted ? 'bg-green-50 text-green-600 border-green-100 opacity-60' :
                                                        isCurrent ? 'bg-white text-blue-600 border-blue-600 shadow-xl shadow-blue-100 scale-105 z-10' :
                                                            isNext ? 'bg-blue-50/50 text-blue-500 border-dashed border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105' :
                                                                'bg-white text-slate-300 border-slate-100 cursor-not-allowed'}`}
                                            >
                                                {isCompleted && <CheckCircle2 size={10} className="inline mr-1" />}
                                                {s.replace("_", " ")}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-8 text-center uppercase tracking-widest">
                                Protocol Enforcement: Status must be updated in linear sequence.
                            </p>
                        </div>

                        {/* Incident Summary */}
                        <div className="mt-10 space-y-6">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <FileText size={20} className="text-slate-400" />
                                Incident Intelligence
                            </h3>

                            {caseData.reportId ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Category</span>
                                        <p className="text-lg font-bold text-slate-800 capitalize">{caseData.reportId.incidentType || 'General Incident'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting Entity UID</span>
                                        <p className="text-sm font-mono font-black text-blue-600">USR-{caseData.reportId.userId?.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="md:col-span-2 pt-4 border-t border-slate-200">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</span>
                                        <p className="text-slate-600 leading-relaxed font-medium">
                                            {caseData.reportId.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                                    <AlertCircle className="text-red-500" size={24} />
                                    <div>
                                        <h4 className="font-black text-red-900 uppercase text-xs">Critical SOS Trigger</h4>
                                        <p className="text-red-600 text-sm font-medium leading-tight">No report narrative attached. This case was triggered via rapid emergency SOS.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Personnel & Logistics */}
                <div className="space-y-8">
                    {/* Patrol Assignment */}
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl shadow-slate-300">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-red-500" />
                            Tactical Response
                        </h3>

                        <form onSubmit={handlePatrolAssignment} className="space-y-4">
                            <div className="relative">
                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter Personnel ID..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-slate-500 focus:bg-white/10 focus:border-red-500 transition-all outline-none"
                                    value={patrolIdInput}
                                    onChange={(e) => setPatrolIdInput(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-900/40 text-xs uppercase tracking-widest">
                                Assign Patrol Unit
                            </button>
                        </form>

                        <div className="mt-8 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Field Units</h4>
                            {caseData.assignedPatrols.length === 0 ? (
                                <p className="text-sm text-slate-500 italic font-medium">No units currently assigned to this sector.</p>
                            ) : (
                                <div className="space-y-3">
                                    {caseData.assignedPatrols.map(p => (
                                        <div key={p._id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                            <div className="bg-white/10 p-2 rounded-lg text-red-400">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black">{p.name}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Unit {p.uid}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Case Metrics</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Response Latency</span>
                                <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">&lt; 2m</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Field Evidence</span>
                                <span className="text-xs font-black text-slate-400">None</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Security Clearance</span>
                                <span className="text-xs font-black text-red-600">Level 4</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
