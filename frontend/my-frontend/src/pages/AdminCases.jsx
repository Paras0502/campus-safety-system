import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";

const AdminCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCases = async () => {
        try {
            const res = await api.get("/admin/cases");
            setCases(res.data.data);
        } catch (error) {
            console.error("Error fetching cases:", error);
            toast.error("Failed to load cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading cases...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Assigned Cases</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {cases.length} Total
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b border-slate-200">Case/Report ID</th>
                            <th className="p-4 border-b border-slate-200">Type</th>
                            <th className="p-4 border-b border-slate-200">Status</th>
                            <th className="p-4 border-b border-slate-200">Priority</th>
                            <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cases.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No active cases found.</td></tr>
                        ) : (
                            cases.map((c) => (
                                <tr key={c._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-sm">{c._id}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.type === 'sos' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {c.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-amber-100 text-amber-700' : c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="uppercase text-xs font-bold tracking-wider">{c.priority}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/admin/cases/${c._id}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-3 py-1 rounded transition hover:bg-blue-100">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCases;
