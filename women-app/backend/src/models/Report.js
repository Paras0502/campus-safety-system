import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        uid: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        incidentType: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            lat: Number,
            lng: Number,
            address: String,
        },

        evidence: [
            {
                type: String,
            },
        ],

        status: {
            type: String,
            enum: [
                "submitted",
                "under_review",
                "investigating",
                "action_taken",
                "closed",
            ],
            default: "submitted",
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);