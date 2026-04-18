import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SOSButton = () => {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSOS = async () => {
        try {
            setLoading(true);

            // Dummy location (we will upgrade later in Phase 6)
            const location = {
                lat: 0,
                lng: 0,
            };

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/sos/trigger",
                { location },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("🚨 Emergency SOS Triggered!");
            setShowModal(false);

        } catch (error) {
            console.error("SOS Error:", error);
            const msg = error.response?.data?.message || "Failed to trigger SOS";
            toast.error(msg);
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    };

    return (
        <>
            {/* Floating SOS Button */}
            <div className="fixed bottom-10 right-10 z-40">
                <button
                    onClick={() => setShowModal(true)}
                    Title="Trigger Emergency SOS"
                    className="relative flex items-center justify-center w-20 h-20 bg-red-600 text-white font-black rounded-full shadow-2xl hover:bg-red-700 transition transform hover:scale-110 active:scale-95 group"
                >
                    <span className="absolute w-full h-full rounded-full bg-red-500 opacity-75 animate-ping group-hover:animate-none"></span>
                    <span className="relative z-10 text-2xl tracking-widest">SOS</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100">
                            <div className="flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4 shadow-sm">
                                <span className="text-4xl font-extrabold pb-1">!</span>
                            </div>
                            <h3 className="text-2xl font-bold text-center text-red-700">
                                Emergency SOS
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-center text-slate-600 font-medium mb-8">
                                Are you sure you want to trigger an emergency SOS? This will alert campus security and all admins immediately.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSOS}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md shadow-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Sending...</span>
                                    ) : (
                                        "Confirm SOS"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SOSButton;