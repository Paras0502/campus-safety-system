import { useState, useEffect } from "react";
import api from "../api";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import LiveMap from "../components/LiveMap";

const PatrolDashboard = () => {
    const [assignedCases, setAssignedCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCaseMapId, setSelectedCaseMapId] = useState(null);

    const fetchAssignedCases = async () => {
        try {
            const res = await api.get("/admin/cases");
            setAssignedCases(res.data.data);
            
            // Auto focus map to the first active case
            const activeCases = res.data.data.filter(c => c.status === "active");
            if (activeCases.length > 0) {
                setSelectedCaseMapId(activeCases[0]._id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load assigned cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedCases();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Patrol Data...</div>;

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-slate-800">Patrol Output</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cases List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Assigned Active Cases</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[500px]">
                        {assignedCases.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active cases assigned to you.</div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {assignedCases.map(c => (
                                    <li 
                                        key={c._id} 
                                        className={`p-4 transition cursor-pointer hover:bg-slate-50 ${selectedCaseMapId === c._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => setSelectedCaseMapId(c._id)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-mono text-sm font-bold text-slate-700">{c._id}</span>
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${c.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm capitalize">Type: {c.type} | Priority: {c.priority}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Map View */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">
                        Live Tracking: {selectedCaseMapId ? selectedCaseMapId.substring(0,8) + "..." : "Standby"}
                    </h3>
                    {/* The LiveMap is already equipped to listen to the specific case stream */}
                    <LiveMap key={selectedCaseMapId} activeCaseId={selectedCaseMapId} />
                </div>
            </div>
        </div>
    );
};

export default PatrolDashboard;
