import Case from "../models/Case.js";
import User from "../models/User.js";
import { updateCaseStatusWithWorkflow, handleAssignmentUpdate } from "../services/caseService.js";

// @desc    Get cases based on role
// @route   GET /api/admin/cases
// @access  Private (Admin/Patrol)
export const getCases = async (req, res) => {
    try {
        let query = {};

        // If patrol, only return cases assigned to them
        if (req.user.role === "patrol") {
            query.assignedPatrols = req.user._id;
        }
        // Admins and super_admins see all cases for now (or could be scoped)

        const cases = await Case.find(query)
            .sort({ createdAt: -1 })
            .populate("reportId", "title description location type")
            .populate("assignedPatrols", "name email")
            .populate("assignedAdmins", "name email");

        res.status(200).json({
            success: true,
            data: cases,
        });
    } catch (error) {
        console.error("Get Cases Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching cases" });
    }
};

// @desc    Get single case
// @route   GET /api/admin/cases/:id
// @access  Private (Admin/Patrol)
export const getCaseById = async (req, res) => {
    try {
        const singleCase = await Case.findById(req.params.id)
            .populate("reportId")
            .populate("assignedPatrols", "name email role")
            .populate("assignedAdmins", "name email role");

        if (!singleCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // Patrol access check
        if (req.user.role === "patrol" && !singleCase.assignedPatrols.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: "Not authorized to view this assigned case" });
        }

        res.status(200).json({
            success: true,
            data: singleCase,
        });
    } catch (error) {
        console.error("Get Case Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching case" });
    }
};

// @desc    Assign patrol or admin to a case
// @route   PATCH /api/admin/cases/:id/assign
// @access  Private (Admin/Super Admin only)
export const assignCase = async (req, res) => {
    try {
        const { patrolIds, adminIds } = req.body;
        const caseId = req.params.id;

        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                $addToSet: {
                    assignedPatrols: { $each: patrolIds || [] },
                    assignedAdmins: { $each: adminIds || [] }
                }
            },
            { new: true }
        )
        .populate("assignedPatrols", "name email")
        .populate("assignedAdmins", "name email");

        if (!updatedCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // ✅ Trigger real-time sync for assignment
        await handleAssignmentUpdate(updatedCase);

        res.status(200).json({
            success: true,
            data: updatedCase,
            message: "Case assignment updated successfully"
        });
    } catch (error) {
        console.error("Assign Case Error:", error);
        res.status(500).json({ success: false, message: "Server Error assigning case" });
    }
};

// @desc    Update case status
// @route   PATCH /api/admin/cases/:id/status
// @access  Private (Admin/Super Admin only)
export const updateCaseStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const caseId = req.params.id;

        // Use Service for workflow enforcement + sync + socket
        const updatedCase = await updateCaseStatusWithWorkflow(caseId, status, req.user.role);

        res.status(200).json({
            success: true,
            data: updatedCase,
            message: `Case status updated to ${status}`
        });
    } catch (error) {
        console.error("Update Case Status Error:", error.message);
        res.status(400).json({ success: false, message: error.message || "Failed to update status" });
    }
};

// ==========================================
// USER MANAGEMENT APIs (RBAC)
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin/Super Admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching users" });
    }
};

// @desc    Update user role conditionally based on executor
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin/Super Admin only)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const targetUserId = req.params.id;
        const executorRole = req.user.role; // The role of the person making the request

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 🛡️ Enforce RBAC rules
        // Rule 1: Nobody can assign 'super_admin' role from an API (must use seeder)
        if (role === "super_admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Super Admin role can only be assigned via system access." });
        }

        // Rule 2: Super Admin can assign 'admin', 'patrol', or 'student'.
        // Rule 3: Admin can only assign 'patrol' or 'student'. They cannot promote to 'admin'.
        if (executorRole === "admin") {
            if (role === "admin") {
                return res.status(403).json({ success: false, message: "Forbidden: Admins cannot grant admin privileges." });
            }
            
            // Admins cannot change the role of a Super Admin or another Admin
            if (targetUser.role === "super_admin" || (targetUser.role === "admin" && targetUserId !== req.user._id.toString())) {
                return res.status(403).json({ success: false, message: "Forbidden: Cannot modify higher tier users." });
            }
        }

        const validRoles = ["student", "admin", "patrol"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified." });
        }

        targetUser.role = role;
        await targetUser.save();

        res.status(200).json({
            success: true,
            data: {
                _id: targetUser._id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            },
            message: `User role successfully updated to ${role}`
        });

    } catch (error) {
        console.error("Update User Role Error:", error);
        res.status(500).json({ success: false, message: "Server Error updating user role" });
    }
};
