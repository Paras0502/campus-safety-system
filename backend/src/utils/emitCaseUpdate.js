import { getIO } from "../config/socket.js";

/**
 * 📡 Emit case updates to all relevant clients
 *
 * @param {String} caseId - ID of the case
 * @param {Object} data - payload to send (status, assignments, etc.)
 */
export const emitCaseUpdate = (caseId, data) => {
    try {
        const io = getIO();

        const payload = {
            caseId,
            ...data,
            timestamp: Date.now(),
        };

        // 👮 Notify all admins
        io.to("admin").emit("case:update", payload);

        // 📍 Notify all users tracking this case
        io.to(`case:${caseId}`).emit("case:update", payload);

        console.log("📡 case:update emitted:", payload);

    } catch (error) {
        console.warn("⚠️ Failed to emit case:update:", error.message);
    }
};