import Case from "../models/Case.js";
import SOS from "../models/SOS.js";
import { getIO } from "../config/socket.js";

// ✅ Trigger SOS Service
export const triggerSOSService = async (user, location) => {
    // 1. Rate Limiting (1 SOS per 30 seconds)
    const recentSOS = await SOS.findOne({
        userId: user._id,
        triggeredAt: { $gte: new Date(Date.now() - 30 * 1000) },
    });

    if (recentSOS) {
        throw new Error("Rate limit exceeded. Please wait 30 seconds before triggering another SOS.");
    }

    // 2. Create Case
    const newCase = await Case.create({
        type: "sos",
        status: "submitted",
        priority: "critical",
    });

    // 3. Create SOS Event
    const sosEvent = await SOS.create({
        userId: user._id,
        uid: user.uid,
        caseId: newCase._id,
        status: "active",
        triggeredAt: new Date(),
    });

    // 4. Emit Event to Admins and Patrols
    try {
        const io = getIO();
        const payload = {
            uid: user.uid,
            location,
            caseId: newCase._id,
            sosId: sosEvent._id,
            timestamp: new Date()
        };
        io.to("admin").to("patrol").emit("sos:alert", payload);
        console.log("🚨 [EMERGENCY] Broadcasting SOS alert to Admin & Patrol rooms:", payload);
    } catch (error) {
        console.warn("⚠️ Socket not initialized for sos:alert emit.");
    }

    return newCase;
};

// ✅ Resolve SOS Service
export const resolveSOSService = async (id) => {
    const sos = await SOS.findById(id);

    if (!sos) {
        throw new Error("SOS not found");
    }

    // 1. Update SOS
    sos.status = "resolved";
    sos.resolvedAt = new Date();
    await sos.save();

    // 2. Update Case
    await Case.findByIdAndUpdate(sos.caseId, {
        status: "closed",
    });

    // 3. Emit case update
    try {
        const io = getIO();
        io.to("admin").to(`case:${sos.caseId}`).emit("case:update", {
            caseId: sos.caseId,
            status: "closed",
        });
    } catch (e) {
        console.warn("⚠️ Socket notification skipped: IO not initialized.");
    }

    return sos;
};
