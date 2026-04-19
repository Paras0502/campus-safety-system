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

const LiveMap = ({ initialLocation }) => {
    const [liveLocations, setLiveLocations] = useState({});

    const defaultCenter = [28.6139, 77.2090];
    const mapCenter = initialLocation
        ? [initialLocation.lat, initialLocation.lng]
        : defaultCenter;

    // 🧠 TEMP CASE ID (replace later with real caseId from SOS)
    const caseId = "TEST_CASE_123";

    /**
     * 📡 RECEIVE LIVE STREAM
     */
    useEffect(() => {
        const handleLocationStream = (data) => {
            console.log("📡 STREAM RECEIVED:", data);

            const { caseId, lat, lng } = data;

            setLiveLocations((prev) => ({
                ...prev,
                [caseId]: { lat, lng }
            }));
        };

        socket.on("location:stream", handleLocationStream);

        return () => {
            socket.off("location:stream", handleLocationStream);
        };
    }, []);

    /**
     * 📍 SEND LOCATION (REAL GPS)
     */
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                console.log("📍 SENDING LOCATION:", latitude, longitude);

                socket.emit("location:update", {
                    caseId,
                    lat: latitude,
                    lng: longitude,
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

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

                {Object.entries(liveLocations).map(([caseId, loc]) => (
                    <Marker
                        key={caseId}
                        position={[loc.lat, loc.lng]}
                        icon={userIcon}
                    >
                        <Popup>
                            <strong>Live Tracking</strong>
                            <br />
                            Case: {caseId.substring(0, 8)}...
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;