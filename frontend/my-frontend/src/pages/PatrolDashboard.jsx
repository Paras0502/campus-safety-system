import { useState, useEffect } from "react";
import { getAllCases } from "../api/caseService";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";
import LiveMap from "../components/LiveMap";
import { useSocket } from "../hooks/useSocket";
import { 
    Shield, 
    Activity, 
    MapPin, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight,
    Loader2
} from "lucide-react";

/**
 * @desc Patrol Module: Focus only on cases assigned to the current patrol unit
 */
const PatrolDashboard = () => {
    const [assignedCases, setAssignedCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCaseMapId, setSelectedCaseMapId] = useState(null);
    const auth = getAuth();
    const socket = useSocket();

    const fetchAssignedCases = async () => {
        try {
            const data = await getAllCases();
            
            // 🔍 FILTER: Only show cases where this patrol unit is explicitly assigned
            const filtered = data.data.filter(c => 
                c.assignedPatrols?.some(p => p._id === auth?.uid || p === auth?.uid)
            );
            
            setAssignedCases(filtered);
            
            // Auto focus map to the first active case if not already selected
            if (filtered.length > 0 && !selectedCaseMapId) {
                const firstActive = filtered.find(c => c.status !== "closed") || filtered[0];
                setSelectedCaseMapId(firstActive._id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Telemetry error: Failed to fetch assignments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedCases();

        // 📡 Real-time Sync for Patrol units
        if (socket) {
            socket.on("case:update", (data) => {
                // Refresh if the update involves an assigned case
                fetchAssignedCases();
            });

            socket.on("sos:alert", (data) => {
                // Patrols should see new SOS alerts if they are potentially involved
                toast.error(`🚨 SOS ALERT IN VICINITY! Case ID: ${data.caseId.substring(0,8)}`, { duration: 6000 });
                fetchAssignedCases();
            });
        }

        return () => {
            if (socket) {
                socket.off("case:update");
                socket.off("sos:alert");
            }
        };
    }, [socket, auth?.uid]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin text-slate-900" size={40} />
                <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Loading Response Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Patrol Intelligence</h2>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                        <Activity size={14} className="text-red-500 animate-pulse" />
                        Live Field Operations Dashboard
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned</span>
                        <span className="text-xl font-black">{assignedCases.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Cases Navigation List */}
                <div className="xl:col-span-4 space-y-4">
                    <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl shadow-slate-300">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                            <Shield size={14} className="text-red-500" /> Active Assignments
                        </h3>
                        
                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {assignedCases.length === 0 ? (
                                <div className="py-10 text-center space-y-4">
                                    <CheckCircle2 size={40} className="mx-auto text-green-500/20" />
                                    <p className="text-slate-500 text-sm font-bold">No active sector assignments.</p>
                                </div>
                            ) : (
                                assignedCases.map(c => (
                                    <div 
                                        key={c._id} 
                                        onClick={() => setSelectedCaseMapId(c._id)}
                                        className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                                            selectedCaseMapId === c._id 
                                            ? 'bg-white text-slate-900 border-white shadow-xl translate-x-1' 
                                            : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                selectedCaseMapId === c._id ? 'bg-slate-900 text-white' : 'bg-white/10 text-slate-500'
                                            }`}>
                                                {c.type}
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${c.status === 'closed' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                        </div>
                                        
                                        <h4 className={`text-sm font-black mb-1 ${selectedCaseMapId === c._id ? 'text-slate-900' : 'text-slate-200'}`}>
                                            Case #{c._id.substring(c._id.length - 8).toUpperCase()}
                                        </h4>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                            Status: {c.status.replace("_", " ")}
                                        </p>
                                        
                                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${selectedCaseMapId === c._id ? 'opacity-100' : 'opacity-0'}`}>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Integration */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white p-2 rounded-[40px] shadow-sm border border-slate-200 h-[600px] relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                             <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                                <div className="bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-200">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Sector View</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                        {selectedCaseMapId ? `Tracking: ${selectedCaseMapId.substring(0,8)}` : "Awaiting Selection"}
                                    </p>
                                </div>
                             </div>
                        </div>

                        {/* Real-time Map Instance */}
                        <div className="w-full h-full rounded-[38px] overflow-hidden grayscale-[0.2] contrast-[1.1]">
                            <LiveMap key={selectedCaseMapId} activeCaseId={selectedCaseMapId} />
                        </div>
                    </div>

                    {/* Quick Case Info (Bottom Sheet Style) */}
                    {selectedCaseMapId && (
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Payload</span>
                                <p className="text-lg font-black text-slate-900 font-mono">#{selectedCaseMapId.substring(selectedCaseMapId.length - 12).toUpperCase()}</p>
                             </div>
                             <div className="space-y-4 md:col-span-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={12} /> Narrative Summary
                                </span>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                    "No detailed narrative currently available for this field log. Refer to dispatch for secondary details."
                                </p>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatrolDashboard;
