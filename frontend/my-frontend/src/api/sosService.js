import axiosInstance from "./axiosInstance";

/**
 * @desc Trigger a new emergency SOS alert
 */
export const triggerSOS = async (location) => {
    const res = await axiosInstance.post("/sos/trigger", { location });
    return res.data;
};

/**
 * @desc Resolve an active SOS alert
 */
export const resolveSOS = async (id) => {
    const res = await axiosInstance.patch(`/sos/${id}/resolve`);
    return res.data;
};
