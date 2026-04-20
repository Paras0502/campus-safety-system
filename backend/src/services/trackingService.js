// src/services/trackingService.js

import Location from "../models/Location.js";
import { getIO } from "../config/socket.js";

// 🧠 In-memory caches
const lastSavedAt = new Map();   // key: userId:caseId → timestamp
const lastCoords = new Map();    // key: userId:caseId → { lat, lng }

/**
 * 📏 Calculate distance (meters) using Haversine
 */
const distanceMeters = (a, b) => {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);

    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * d;
};

/**
 * 🚫 Ignore tiny GPS noise (default: 5 meters)
 */
const isSignificantMove = (prev, next, threshold = 5) => {
    if (!prev) return true;
    return distanceMeters(prev, next) >= threshold;
};

/**
 * 📡 Emit location update to case room ONLY
 */
export const emitLocation = (caseId, payload) => {
    try {
        const io = getIO();

        io.to(`case:${caseId}`).emit("location:stream", payload);

    } catch (err) {
        console.warn("⚠️ Failed to emit location:", err.message);
    }
};

/**
 * 💾 Save location with throttle + jitter filtering
 */
export const saveLocationService = async (
    userId,
    caseId,
    lat,
    lng,
    throttleSeconds = 3
) => {
    const key = `${userId}:${caseId}`;
    const now = Date.now();

    const prevCoords = lastCoords.get(key);
    const nextCoords = { lat, lng };

    /**
     * 🚫 Skip if movement too small
     */
    if (!isSignificantMove(prevCoords, nextCoords)) {
        return null;
    }

    /**
     * ⏱ Throttle DB writes
     */
    const lastTime = lastSavedAt.get(key) || 0;
    if (now - lastTime < throttleSeconds * 1000) {
        lastCoords.set(key, nextCoords);
        return null;
    }

    /**
     * 💾 Save to DB
     */
    const location = await Location.create({
        userId,
        caseId,
        coordinates: nextCoords,
        timestamp: new Date(),
    });

    lastSavedAt.set(key, now);
    lastCoords.set(key, nextCoords);

    return location;
};