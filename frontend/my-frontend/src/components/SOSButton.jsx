import { useState } from "react";
import toast from "react-hot-toast";
import { triggerSOS } from "../api/sosService";
import { useSocket } from "../hooks/useSocket";
import { AlertTriangle, Loader2, Shield } from "lucide-react";

/**
 * @desc Floating SOS Button with real-time location streaming
 */
const SOSButton = () => {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const socket = useSocket();

    const handleSOS = async () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        try {
            setLoading(true);

            // Get initial location
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    const res = await triggerSOS(location);
                    const caseId = res.data.caseId;

                    toast.success("🚨 Emergency SOS Triggered!");

                    // Start streaming location for live tracking (every 3 seconds)
                    const intervalId = setInterval(() => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                if (socket) {
                                    socket.emit("location:update", {
                                        caseId,
                                        lat: pos.coords.latitude,
                                        lng: pos.coords.longitude,
                                    });
                                }
                            },
                            (err) => console.error("Tracking Error:", err),
                            { enableHighAccuracy: true }
                        );
                    }, 3000);

                    setTrackingId(intervalId); // Will clear interval later on resolve
                    setShowModal(false);
                    setLoading(false);
                },
                (error) => {
                    console.error("Location Error:", error);
                    toast.error("Could not fetch location. SOS aborted.");
                    setLoading(false);
                    setShowModal(false);
                },
                { enableHighAccuracy: true }
            );

        } catch (error) {
            console.error("SOS Error:", error);
            const msg = error.response?.data?.message || "Failed to trigger SOS";
            toast.error(msg);
            setLoading(false);
            setShowModal(false);
        }
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (trackingId) clearInterval(trackingId);
        };
    }, [trackingId]);

    return (
        <>
            {/* Floating SOS Button */}
            <div className="fixed bottom-10 right-10 z-40">
                <button
                    onClick={() => setShowModal(true)}
                    className="relative flex items-center justify-center w-20 h-20 bg-red-600 text-white font-black rounded-full shadow-2xl hover:bg-red-700 transition transform hover:scale-110 active:scale-95 group"
                >
                    <span className="absolute w-full h-full rounded-full bg-red-500 opacity-75 animate-ping group-hover:animate-none"></span>
                    <span className="relative z-10 text-2xl tracking-widest font-black">SOS</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-10 flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-white/20 text-white rounded-2xl mb-4 backdrop-blur-sm">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-center text-white uppercase tracking-tighter">
                                Emergency SOS
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <p className="text-center text-slate-500 font-bold leading-relaxed">
                                Triggering this will immediately alert all campus security units and stream your live location. Use only in case of emergency.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSOS}
                                    disabled={loading}
                                    className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition shadow-xl shadow-red-100 uppercase tracking-widest text-xs flex justify-center items-center"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                    ) : (
                                        "Confirm & Alert Security"
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition uppercase tracking-widest text-[10px]"
                                >
                                    Cancel Request
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