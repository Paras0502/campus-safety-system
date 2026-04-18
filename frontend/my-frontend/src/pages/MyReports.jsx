import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Clock, MapPin, ShieldAlert, Loader2, Info } from "lucide-react";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
    }, []);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "resolved":
                return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Resolved</span>;
            case "active":
            case "pending":
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">Active</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">{status || "Unknown"}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin w-10 h-10 mb-4 text-red-500" />
                <p className="font-medium">Loading your reports...</p>
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">My Reports</h2>
                    <p className="text-slate-500 mt-1">Track the status of incidents you have reported.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-800">{reports.length}</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Submissions</span>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-200 p-4 rounded-full mb-4">
                        <Info className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Reports Found</h3>
                    <p className="text-slate-500 max-w-md">You haven't submitted any incident reports yet. New reports will appear here once filed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
                                    {report.incidentType || "Incident"}
                                </h3>
                                {getStatusBadge(report.status)}
                            </div>
                            
                            <p className="text-slate-600 mb-6 line-clamp-3">
                                {report.description}
                            </p>
                            
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <MapPin size={16} className="text-slate-400" />
                                    <span className="font-medium truncate">{report.location?.address || "Location not provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Clock size={16} className="text-slate-400" />
                                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReports;