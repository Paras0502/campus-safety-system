import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
        index: true,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Location = mongoose.model("Location", locationSchema);

export default Location;