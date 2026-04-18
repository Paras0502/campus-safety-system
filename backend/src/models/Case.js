import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
    {
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Report",
            default: null,
        },

        type: {
            type: String,
            enum: ["report", "sos"],
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "resolved", "closed"],
            default: "active",
        },

        assignedAdmins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        assignedPatrols: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Case", caseSchema);