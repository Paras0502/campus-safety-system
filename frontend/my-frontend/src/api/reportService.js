import axiosInstance from "./axiosInstance";

/**
 * @desc Submit a new incident report
 * @route POST /api/reports
 * @param {Object} reportData - { description, incidentType, location: { address }, evidence? }
 */
export const createReport = async (reportData) => {
    const res = await axiosInstance.post("/reports", reportData);
    return res.data;
};

/**
 * @desc Get reports created by the logged-in student
 * @route GET /api/reports/my
 */
export const getMyReports = async () => {
    const res = await axiosInstance.get("/reports/my");
    return res.data;
};

/**
 * @desc Get a single report by ID
 * @route GET /api/reports/:id
 * @param {string} id - Report ID
 */
export const getReportById = async (id) => {
    const res = await axiosInstance.get(`/reports/${id}`);
    return res.data;
};
