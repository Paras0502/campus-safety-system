import Location from "../models/Location.js";
import { getIO } from "../config/socket.js";

// Stores last saved timestamps to throttle DB writes
const lastSavedLocationMap = new Map();

export const emitLocation = async (socket, data) => {
    const { caseId, lat, lng } = data;
    
    // Broadcast directly to the case room
    const io = getIO();
    io.to(`case:${caseId}`).emit("location:stream", {
        caseId,
        userId: socket.user.id,
        lat,
        lng,
    });
};

export const saveLocationService = async (userId, caseId, lat, lng, throttleSeconds = 0) => {
    const key = `${userId}_${caseId}`;
    const now = Date.now();

    if (throttleSeconds > 0) {
        const lastSaved = lastSavedLocationMap.get(key) || 0;
        if (now - lastSaved < throttleSeconds * 1000) {
            // Skipped due to throttle
            return null;
        }
    }

    const location = await Location.create({
        userId,
        caseId,
        coordinates: { lat, lng },
        timestamp: new Date(),
    });

    if (throttleSeconds > 0) {
        lastSavedLocationMap.set(key, now);
    }

    return location;
};
