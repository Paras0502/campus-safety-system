import Report from "../models/Report.js";

// ✅ Create Report
export const createReport = async (req, res) => {
    try {
        const { description, incidentType, location, evidence } = req.body;

        if (!description || !incidentType) {
            return res.status(400).json({
                message: "Description and incident type are required",
            });
        }

        const report = await Report.create({
            userId: req.user._id,
            uid: req.user.uid,
            description,
            incidentType,
            location,
            evidence: evidence || [],
        });

        res.status(201).json({
            message: "Report submitted successfully",
            report,
        });
    } catch (error) {
        console.error("Create Report Error:", error.message);
        res.status(500).json({ message: "Server error while creating report" });
    }
};

// ✅ Get My Reports
export const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user._id }).sort({
            createdAt: -1,
        });

        res.status(200).json(reports);
    } catch (error) {
        console.error("Get My Reports Error:", error.message);
        res.status(500).json({ message: "Server error while fetching reports" });
    }
};

// ✅ Get Report by ID
export const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate(
            "assignedTo",
            "uid role"
        );

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("Get Report Error:", error.message);
        res.status(500).json({ message: "Server error while fetching report" });
    }
};

// ✅ Update Status
export const updateReportStatus = async (req, res) => {
    try {
        const { status, assignedTo } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (status) report.status = status;
        if (assignedTo) report.assignedTo = assignedTo;

        await report.save();

        res.status(200).json({
            message: "Report updated successfully",
            report,
        });
    } catch (error) {
        console.error("Update Report Error:", error.message);
        res.status(500).json({ message: "Server error while updating report" });
    }
};