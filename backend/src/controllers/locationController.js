import Location from "../models/Location.js";

// @desc    Store location (fallback API)
// @route   POST /api/location/update
// @access  Private
export const updateLocation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { caseId, lat, lng } = req.body;

        if (!caseId || lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: "caseId, lat and lng are required",
            });
        }

        const location = await Location.create({
            userId,
            caseId,
            coordinates: {
                lat,
                lng,
            },
            timestamp: new Date(),
        });

        res.status(201).json({
            success: true,
            location,
        });

    } catch (error) {
        console.error("Location Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};