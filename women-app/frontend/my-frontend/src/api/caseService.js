import axiosInstance from "./axiosInstance";

/**
 * @desc Get all cases (Admin access)
 */
export const getAllCases = async () => {
    const res = await axiosInstance.get("/admin/cases");
    return res.data;
};

/**
 * @desc Get case by ID (Admin/Patrol access)
 */
export const getCaseById = async (id) => {
    const res = await axiosInstance.get(`/admin/cases/${id}`);
    return res.data;
};

/**
 * @desc Update case status (Admin only)
 * @param {string} id - Case ID
 * @param {string} status - New workflow status
 */
export const updateCaseStatus = async (id, status) => {
    const res = await axiosInstance.patch(`/admin/cases/${id}/status`, { status });
    return res.data;
};

/**
 * @desc Assign patrols or admins to a case
 */
export const assignCase = async (id, data) => {
    const res = await axiosInstance.patch(`/admin/cases/${id}/assign`, data);
    return res.data;
};
