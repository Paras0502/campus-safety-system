import { useState } from "react";
import { createReport } from "../api/reportService";
import { Send, FileText, MapPin, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * @desc Student Page: Submit a detailed incident report
 */
const CreateReport = () => {
    const [formData, setFormData] = useState({
        description: "",
        incidentType: "",
        location: {
            address: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "address") {
            setFormData({
                ...formData,
                location: { ...formData.location, address: value },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await createReport(formData);

            toast.success("Report submitted successfully! Security has been notified.");
            
            // Redirect to My Reports to see the status
            setTimeout(() => {
                navigate("/student/reports");
            }, 1500);

            // Reset form
            setFormData({
                description: "",
                incidentType: "",
                location: { address: "" },
            });
        } catch (error) {
            console.error(error);
            toast.error("Error submitting report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                    <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl shadow-red-100">
                        <FileText size={32} />
                    </div>
                    File a Report
                </h2>
                <p className="text-slate-500 font-bold max-w-lg mt-4">
                    Detailed intelligence helps our security teams respond effectively. Please provide as much context as possible.
                </p>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
                    {/* Incident Type */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Intelligence Category
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                                <AlertCircle size={20} className="text-slate-300" />
                            </div>
                            <input
                                type="text"
                                name="incidentType"
                                value={formData.incidentType}
                                onChange={handleChange}
                                placeholder="e.g. Harassment, Theft, Suspicious Activity"
                                className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-800 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Specific Location
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                                <MapPin size={20} className="text-slate-300" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                onChange={handleChange}
                                placeholder="e.g. Science Block Floor 3, Cafeteria Entrance"
                                className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-800 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Incident Narrative
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please describe the situation, number of persons involved, and any immediate threats..."
                            rows="6"
                            className="block w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-800 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-8 flex flex-col items-center gap-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full max-w-md py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-red-600 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs flex justify-center items-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing Intelligence...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Official Report
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Secure Encrypted Submission
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReport;