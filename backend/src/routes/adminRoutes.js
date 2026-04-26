import express from "express";
import { getCases, getCaseById, assignCase, updateCaseStatus, getUsers, updateUserRole } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Case Fetch APIs (Step 1)
router.get("/cases", allowRoles("admin", "super_admin", "patrol"), getCases);
router.get("/cases/:id", allowRoles("admin", "super_admin", "patrol"), getCaseById);

// Case Management APIs (Step 2 & 3)
router.patch("/cases/:id/assign", allowRoles("admin", "super_admin"), assignCase);
router.patch("/cases/:id/status", allowRoles("admin", "super_admin"), updateCaseStatus);

// User Management APIs
router.get("/users", allowRoles("admin", "super_admin"), getUsers);
router.patch("/users/:id/role", allowRoles("admin", "super_admin"), updateUserRole);

export default router;
