import { useSocket as useSocketContext } from "../context/SocketContext";

/**
 * @desc Hook to access the global Socket.IO instance
 */
export const useSocket = () => {
    return useSocketContext();
};
