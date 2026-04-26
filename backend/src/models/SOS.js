import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // ✅ MUST MATCH model name
            required: true,
        },

        uid: {
            type: String,
            required: true,
        },

        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "resolved"],
            default: "active",
        },

        triggeredAt: {
            type: Date,
            default: Date.now,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);