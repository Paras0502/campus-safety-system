import { triggerSOSService, resolveSOSService } from "../services/sosService.js";

// 🚨 Trigger SOS
export const triggerSOS = async (req, res) => {
    try {
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

        const newCase = await triggerSOSService(req.user, location);

        return res.status(201).json({
            success: true,
            message: "SOS triggered successfully",
            data: { caseId: newCase._id },
        });
    } catch (error) {
        console.error("SOS Trigger Error:", error.message);
        
        if (error.message.includes("Rate limit exceeded")) {
             return res.status(429).json({
                success: false,
                message: error.message,
                data: null,
            });
        }
        
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
        await resolveSOSService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "SOS resolved successfully",
            data: null,
        });
    } catch (error) {
        console.error("Resolve SOS Error:", error.message);
        
        if (error.message === "SOS not found") {
            return res.status(404).json({
                success: false,
                message: "SOS not found",
                data: null,
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Server error while resolving SOS",
            data: null,
        });
    }
};