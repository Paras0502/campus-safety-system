import mongoose from "mongoose";
import dotenv from "dotenv";
import Case from "../models/Case.js";
import Report from "../models/Report.js";
import { updateCaseStatusWithWorkflow } from "../services/caseService.js";

dotenv.config();

const testWorkflow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB:", process.env.MONGO_URI);

        // 1. Create Mock Data
        const mockReport = await Report.create({
            userId: new mongoose.Types.ObjectId(),
            uid: "TEST-" + Date.now(),
            description: "Test Incident",
            incidentType: "Theft",
            status: "submitted"
        });

        const mockCase = await Case.create({
            reportId: mockReport._id,
            type: "report",
            status: "submitted"
        });

        console.log(`Created Mock Case: ${mockCase._id} with Status: ${mockCase.status}`);

        // 2. Valid Transition: submitted -> under_review
        console.log("\n--- Testing Valid Transition: submitted -> under_review ---");
        await updateCaseStatusWithWorkflow(mockCase._id, "under_review", "admin");
        
        const updatedCase1 = await Case.findById(mockCase._id);
        const updatedReport1 = await Report.findById(mockReport._id);
        console.log(`Case Status: ${updatedCase1.status}`);
        console.log(`Report Status Sync: ${updatedReport1.status}`);

        if (updatedReport1.status !== "under_review") throw new Error("Report Sync Failed");

        // 3. Invalid Transition: under_review -> closed (skipping states)
        console.log("\n--- Testing Invalid Transition: under_review -> closed ---");
        try {
            await updateCaseStatusWithWorkflow(mockCase._id, "closed", "admin");
            console.error("❌ ERROR: Workflow enforcement failed! Should not allow skipping.");
        } catch (error) {
            console.log(`✅ Success: Blocked invalid skip: ${error.message}`);
        }

        // 4. Valid Transition: under_review -> investigating
        console.log("\n--- Testing Valid Transition: under_review -> investigating ---");
        await updateCaseStatusWithWorkflow(mockCase._id, "investigating", "admin");
        const updatedCase2 = await Case.findById(mockCase._id);
        console.log(`Case Status: ${updatedCase2.status}`);

        // Cleanup
        await Case.findByIdAndDelete(mockCase._id);
        await Report.findByIdAndDelete(mockReport._id);
        console.log("\nCleanup successful.");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
};

testWorkflow();
