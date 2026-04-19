import axiosInstance from "./axiosInstance";

/**
 * @desc Get reports created by the logged-in student
 */
export const getMyReports = async () => {
    const res = await axiosInstance.get("/reports/my");
    return res.data;
};
