import Case from "../models/Case.js";
import SOS from "../models/SOS.js";
import { getIO } from "../config/socket.js";
import { emitCaseUpdate } from "../utils/emitCaseUpdate.js";

// 🧠 In-memory guard to prevent rapid duplicate SOS
const activeSOSMap = new Map();

/**
 * 🚨 Trigger SOS
 */
export const triggerSOSService = async (user, location) => {
    const userId = user.id;

    // 🚫 Memory-level duplicate guard
    if (activeSOSMap.has(userId)) {
        console.log("⚠️ Duplicate SOS blocked (memory)");
        return;
    }

    try {
        activeSOSMap.set(userId, true);

        /**
         * 1️⃣ DB rate limit (30 sec)
         */
        const recentSOS = await SOS.findOne({
            userId,
            triggeredAt: { $gte: new Date(Date.now() - 30 * 1000) },
        });

        if (recentSOS) {
            activeSOSMap.delete(userId);
            throw new Error("Rate limit exceeded (30s)");
        }

        /**
         * 2️⃣ Create Case
         */
        const newCase = await Case.create({
            type: "sos",
            status: "investigating", // ✅ FIXED
            priority: "critical",
            assignedAdmins: [],
            assignedPatrols: [],
        });

        /**
         * 3️⃣ Create SOS Event
         */
        const sosEvent = await SOS.create({
            userId,
            uid: user.uid,
            caseId: newCase._id,
            status: "active", // This is fine (SOS schema allows it)
            triggeredAt: new Date(),
        });

        /**
         * 🚨 Emit ONLY after DB success
         */
        const io = getIO();

        const payload = {
            caseId: newCase._id,
            sosId: sosEvent._id,
            uid: user.uid,
            location,
            timestamp: new Date(),
        };

        console.log("🚨 SOS EMIT START");

        io.to("admin").emit("sos:alert", payload);
        io.to("patrol").emit("sos:alert", payload);

        console.log("✅ SOS EMITTED SUCCESSFULLY");

        /**
         * 🔄 Sync case creation
         */
        emitCaseUpdate(newCase._id, {
            status: "investigating", // ✅ FIXED
            type: "sos",
        });

        /**
         * ⏳ Reset memory guard after 10 sec
         */
        setTimeout(() => {
            activeSOSMap.delete(userId);
        }, 10000);

        return newCase;

    } catch (error) {
        activeSOSMap.delete(userId);
        console.error("❌ SOS ERROR:", error.message);
        throw error;
    }
};


/**
 * ✅ Resolve SOS
 */
export const resolveSOSService = async (id) => {
    const sos = await SOS.findById(id);

    if (!sos) {
        throw new Error("SOS not found");
    }

    /**
     * 1️⃣ Update SOS
     */
    sos.status = "resolved";
    sos.resolvedAt = new Date();
    await sos.save();

    /**
     * 2️⃣ Update Case
     */
    await Case.findByIdAndUpdate(sos.caseId, {
        status: "closed",
    });

    /**
     * 🔄 Emit update (GLOBAL SYNC)
     */
    emitCaseUpdate(sos.caseId, {
        status: "closed",
    });

    return sos;
};