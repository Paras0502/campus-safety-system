import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, connectSocket } from '../socket';
import { getAuth } from '../utils/auth';

const SocketContext = createContext(null);

/**
 * 🔌 Access the live socket instance from anywhere in the app.
 * Returns the socket object directly (or null if not yet connected).
 */
export const useSocket = () => useContext(SocketContext);

/**
 * 🌐 SocketProvider
 *
 * Wraps the app to provide a single, authenticated socket instance.
 * - Connects on mount if a token exists (page refresh recovery)
 * - Tracks connected state
 * - Provides the socket via context
 */
export const SocketProvider = ({ children }) => {
    const { token } = getAuth();
    const socket = getSocket();
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // 🔐 If user has a token (e.g. page refresh), reconnect the socket
        if (token && !socket.connected) {
            connectSocket(token);
        }

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
