import React, { createContext, useContext, useEffect, useState } from 'react';
import socket, { connectSocket } from '../socket';
import { getAuth } from '../utils/auth';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token } = getAuth();
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        if (token) {
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
