import express from "express";
const router = express.Router();

import {
    createReport,
    getMyReports,
    getReportById,
    updateReportStatus,
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

// Create Report
router.post("/", authMiddleware, allowRoles("student"), createReport);

// Get My Reports
router.get("/my", authMiddleware, allowRoles("student"), getMyReports);

// Get Report by ID
router.get(
    "/:id",
    authMiddleware,
    allowRoles("admin", "super_admin"),
    getReportById
);

// Update Status
router.patch(
    "/:id/status",
    authMiddleware,
    allowRoles("admin", "super_admin"),
    updateReportStatus
);

export default router;