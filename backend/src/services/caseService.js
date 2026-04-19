import Case from "../models/Case.js";
import Report from "../models/Report.js";
import { getIO } from "../config/socket.js";

/**
 * 🔄 STATUS WORKFLOW DEFINITION
 */
const STATUS_ORDER = [
    "submitted",
    "under_review",
    "investigating",
    "action_taken",
    "closed",
];

/**
 * @desc Validate if a transition from current status to next status is allowed
 */
const isValidTransition = (current, next) => {
    const currentIndex = STATUS_ORDER.indexOf(current);
    const nextIndex = STATUS_ORDER.indexOf(next);

    // Rule: No skipping states (must be next in line) or staying in same state
    // Exception: closed can be reached from action_taken
    return nextIndex === currentIndex + 1;
};

/**
 * @desc Update Case Status with Workflow enforcement and synchronization
 */
export const updateCaseStatusWithWorkflow = async (caseId, newStatus, userRole) => {
    const caseItem = await Case.findById(caseId).populate("reportId");

    if (!caseItem) {
        throw new Error("Case not found");
    }

    // 1. Validate Transition (Enforcement)
    // Only Admin/Super Admin can skip if needed, but for now we follow strict workflow
    if (!isValidTransition(caseItem.status, newStatus)) {
        throw new Error(`Invalid transition: ${caseItem.status} → ${newStatus}. Workflow must be sequential.`);
    }

    // 2. Update Case
    caseItem.status = newStatus;
    await caseItem.save();

    // 3. Sync with Report (Single source of truth)
    if (caseItem.reportId) {
        const report = await Report.findById(caseItem.reportId._id);
        if (report) {
            report.status = newStatus;
            await report.save();
        }
    }

    // 4. Real-time Emit (Socket.IO)
    try {
        const io = getIO();
        io.emit("case:update", {
            caseId: caseItem._id,
            status: newStatus,
            reportId: caseItem.reportId?._id,
            studentId: caseItem.reportId?.userId, // Useful for student-specific filtering on frontend
            assignedPatrols: caseItem.assignedPatrols,
        });
    } catch (e) {
        console.warn("⚠️ Socket notification skipped: IO not initialized.");
    }

    return caseItem;
};

/**
 * @desc Handle logic for assignment change notifications
 */
export const handleAssignmentUpdate = async (caseItem) => {
    try {
        const io = getIO();
        io.emit("case:update", {
            caseId: caseItem._id,
            status: caseItem.status,
            assignedPatrols: caseItem.assignedPatrols,
            assignedAdmins: caseItem.assignedAdmins,
        });
    } catch (e) {
        console.warn("⚠️ Socket notification skipped: IO not initialized.");
    }
};
