// src/utils/triggerSOS.js

let isSOSActive = false;

/**
 * 🚨 Trigger SOS (with UI guard)
 *
 * @param {Object} socket - socket instance
 * @param {Object} location - { lat, lng }
 * @param {Function} [onError] - optional error handler
 */
export const triggerSOS = (socket, location, onError) => {
    try {
        // 🚫 Prevent rapid duplicate clicks
        if (isSOSActive) {
            console.log("⚠️ SOS blocked (UI guard)");
            return;
        }

        // Basic validation
        if (
            !location ||
            typeof location.lat !== "number" ||
            typeof location.lng !== "number"
        ) {
            throw new Error("Invalid location");
        }

        isSOSActive = true;

        console.log("🚨 Sending SOS...");

        socket.emit("sos:trigger", { location });

        /**
         * ⏳ Cooldown (5 sec)
         * Matches backend memory guard behavior
         */
        setTimeout(() => {
            isSOSActive = false;
        }, 5000);

    } catch (err) {
        console.error("❌ SOS UI error:", err.message);

        // Reset guard on failure
        isSOSActive = false;

        if (onError) onError(err.message);
    }
};