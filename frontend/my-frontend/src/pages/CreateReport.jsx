import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Send, FileText, MapPin, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CreateReport = () => {
    const [formData, setFormData] = useState({
        description: "",
        incidentType: "",
        location: {
            address: "",
        },
    });

    const [loading, setLoading] = useState(false);

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
            await axiosInstance.post("/reports", formData);

            toast.success("Report submitted successfully! Security has been notified.");

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
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <FileText className="text-red-600" size={32} />
                    File an Incident Report
                </h2>
                <p className="text-slate-500 mt-2">
                    Submit details of any suspicious activity or incident. Your report will be reviewed by campus security immediately.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Incident Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            Incident Type
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <AlertCircle className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="incidentType"
                                value={formData.incidentType}
                                onChange={handleChange}
                                placeholder="e.g. Suspicious Person, Harassment, Theft"
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            Location Description
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                onChange={handleChange}
                                placeholder="Specific location (e.g. Library 2nd Floor, North Parking Lot)"
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            Detailed Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide as much detail as possible about what happened..."
                            rows="5"
                            className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition resize-none"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 py-3 px-8 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReport;