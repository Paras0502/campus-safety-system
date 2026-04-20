import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import socket from "../socket";

const userIcon = new L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const LiveMap = ({ initialLocation, activeCaseId }) => {
    const [liveLocations, setLiveLocations] = useState({});

    const defaultCenter = [28.6139, 77.2090];
    const mapCenter = initialLocation
        ? [initialLocation.lat, initialLocation.lng]
        : defaultCenter;

    const caseId = activeCaseId; // Replaced TEMP CASE ID

    /**
     * 📡 RECEIVE LIVE STREAM & JOIN ROOM
     */
    useEffect(() => {
        if (caseId && socket) {
            socket.emit("case:join", caseId);
        }

        const handleLocationStream = (data) => {
            console.log("📡 STREAM RECEIVED:", data);

            const { caseId: streamCase, lat, lng, userId } = data;

            // Only update if it pertains to the active case being viewed
            if (streamCase === caseId) {
                setLiveLocations((prev) => ({
                    ...prev,
                    [userId]: { lat, lng } // Track by userId so multiple people on same case can be seen
                }));
            }
        };

        socket.on("location:stream", handleLocationStream);

        return () => {
            socket.off("location:stream", handleLocationStream);
        };
    }, [caseId, socket]);

    /**
     * 📍 SEND LOCATION (REAL GPS using 3 sec interval)
     */
    useEffect(() => {
        if (!navigator.geolocation || !caseId) {
            console.error("Geolocation not supported or missing caseId");
            return;
        }

        const intervalId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // console.log("📍 SENDING LOCATION:", latitude, longitude);

                    socket.emit("location:update", {
                        caseId,
                        lat: latitude,
                        lng: longitude,
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                },
                { enableHighAccuracy: true }
            );
        }, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [caseId]);

    return (
        <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
            <MapContainer
                center={mapCenter}
                zoom={14}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {initialLocation && (
                    <Marker
                        position={[initialLocation.lat, initialLocation.lng]}
                        icon={userIcon}
                    >
                        <Popup>Initial SOS Location</Popup>
                    </Marker>
                )}

                {Object.entries(liveLocations).map(([userId, loc]) => (
                    <Marker
                        key={userId}
                        position={[loc.lat, loc.lng]}
                        icon={userIcon}
                    >
                        <Popup>
                            <strong>Live Tracking</strong>
                            <br />
                            User: {userId.substring(0, 8)}...
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;