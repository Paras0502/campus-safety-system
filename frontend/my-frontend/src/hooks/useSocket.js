import { useEffect } from "react";
import { getSocket } from "../socket";

/**
 * 🧠 Unified Socket Hook
 *
 * @param {Object} options
 * @param {Array} options.activeCaseIds
 * @param {Function} options.onCaseUpdate
 * @param {Function} options.onSOSAlert
 * @param {Function} options.onLocationUpdate
 */
const useSocket = ({
    activeCaseIds = [],
    onCaseUpdate,
    onSOSAlert,
    onLocationUpdate,
}) => {
    useEffect(() => {
        const socket = getSocket();

        /**
         * 🔄 Reconnect → rejoin case rooms
         */
        const handleConnect = () => {
            console.log("🔌 Connected / Reconnected");

            if (activeCaseIds.length > 0) {
                socket.emit("cases:rejoin", activeCaseIds);
            }
        };

        /**
         * 📦 Case updates
         */
        const handleCaseUpdate = (data) => {
            console.log("📦 case:update", data);
            onCaseUpdate && onCaseUpdate(data);
        };

        /**
         * 🚨 SOS alerts
         */
        const handleSOSAlert = (data) => {
            console.log("🚨 sos:alert", data);
            onSOSAlert && onSOSAlert(data);
        };

        /**
         * 📍 Location updates
         */
        const handleLocationStream = (data) => {
            onLocationUpdate && onLocationUpdate(data);
        };

        /**
         * 🔌 Register listeners
         */
        socket.on("connect", handleConnect);
        socket.on("case:update", handleCaseUpdate);
        socket.on("sos:alert", handleSOSAlert);
        socket.on("location:stream", handleLocationStream);

        /**
         * 🧹 Cleanup (CRITICAL)
         */
        return () => {
            socket.off("connect", handleConnect);
            socket.off("case:update", handleCaseUpdate);
            socket.off("sos:alert", handleSOSAlert);
            socket.off("location:stream", handleLocationStream);
        };
    }, [activeCaseIds, onCaseUpdate, onSOSAlert, onLocationUpdate]);
};

export default useSocket;