import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";

const CaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => { fetchCase(); }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`/admin/cases/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchCase();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAssignPatrol = async (e) => {
        e.preventDefault();
        try {
            // simple parsing for multiple IDs if comma-separated
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Case Details</h2>
                        <p className="text-slate-500 font-mono text-sm mt-1">{caseData._id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest ${caseData.status === 'active' ? 'bg-amber-100 text-amber-700' : caseData.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {caseData.status}
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

            {/* Management Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Status Update */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Update Status</h3>
                    <div className="flex gap-2">
                        {['active', 'resolved', 'closed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusUpdate(s)}
                                disabled={caseData.status === s}
                                className={`flex-1 py-2 px-4 rounded font-bold transition capitalize ${caseData.status === s ? 'bg-slate-800 text-white cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

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
                        <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 transition">
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
                                    <li key={p._id} className="text-sm bg-slate-50 p-2 rounded border border-slate-100 font-medium text-slate-700">
                                        {p.name} <span className="text-slate-400 font-normal">({p.email})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CaseDetail;
