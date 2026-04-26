import Report from "../models/Report.js";

export const createReportService = async (userId, uid, description, incidentType, location, evidence) => {
    return await Report.create({
        userId,
        uid,
        description,
        incidentType,
        location,
        evidence: evidence || [],
    });
};

export const getMyReportsService = async (userId) => {
    return await Report.find({ userId }).sort({ createdAt: -1 });
};

export const getReportByIdService = async (id) => {
    return await Report.findById(id).populate("assignedTo", "uid role");
};

export const updateReportStatusService = async (id, status, assignedTo) => {
    const report = await Report.findById(id);
    if (!report) {
        throw new Error("Report not found");
    }
    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;

    return await report.save();
};
