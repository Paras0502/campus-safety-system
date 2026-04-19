import Case from "../models/Case.js";
import SOS from "../models/SOS.js";
import { getIO } from "../config/socket.js";

// 🚨 Trigger SOS
export const triggerSOS = async (req, res) => {
    try {
        // 🔍 DEBUG (can remove later)
        console.log("========== DEBUG START ==========");
        console.log("REQ USER FULL:", req.user);
        console.log("USER ID:", req.user?._id);
        console.log("USER UID:", req.user?.uid);
        console.log("========== DEBUG END ==========");

        const { location } = req.body;

        // ✅ Validation
        if (
            !location ||
            typeof location.lat !== "number" ||
            typeof location.lng !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid location coordinates (lat, lng) are required.",
                data: null,
            });
        }

        // ✅ Rate Limiting (1 SOS per 30 seconds)
        const recentSOS = await SOS.findOne({
            userId: req.user._id,
            triggeredAt: { $gte: new Date(Date.now() - 30 * 1000) },
        });

        if (recentSOS) {
            return res.status(429).json({
                success: false,
                message:
                    "Rate limit exceeded. Please wait 30 seconds before triggering another SOS.",
                data: null,
            });
        }

        console.log(
            `[SOS TRIGGER] UID: ${req.user.uid} | Timestamp: ${new Date().toISOString()}`
        );

        // ✅ 1. Create Case (FIXED STATUS)
        const newCase = await Case.create({
            type: "sos",
            status: "submitted", // ✅ FIXED
            priority: "critical",
        });

        // ✅ 2. Create SOS Event
        const sosEvent = await SOS.create({
            userId: req.user._id,
            uid: req.user.uid,
            caseId: newCase._id,
            status: "active", // ✅ correct for SOS lifecycle
            triggeredAt: new Date(),
        });

        // ✅ 3. Emit Event
        const io = getIO();
        io.emit("sos:alert", {
            uid: req.user.uid,
            location,
            caseId: newCase._id,
        });

        return res.status(201).json({
            success: true,
            message: "SOS triggered successfully",
            data: { caseId: newCase._id },
        });
    } catch (error) {
        console.error("SOS Trigger Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while triggering SOS",
            data: null,
        });
    }
};

// ✅ Resolve SOS
export const resolveSOS = async (req, res) => {
    try {
        const sos = await SOS.findById(req.params.id);

        if (!sos) {
            return res.status(404).json({
                success: false,
                message: "SOS not found",
                data: null,
            });
        }

        // ✅ Update SOS
        sos.status = "resolved";
        sos.resolvedAt = new Date();
        await sos.save();

        // ✅ Update Case (FIXED STATUS)
        await Case.findByIdAndUpdate(sos.caseId, {
            status: "closed", // ✅ FIXED
        });

        return res.status(200).json({
            success: true,
            message: "SOS resolved successfully",
            data: null,
        });
    } catch (error) {
        console.error("Resolve SOS Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while resolving SOS",
            data: null,
        });
    }
};