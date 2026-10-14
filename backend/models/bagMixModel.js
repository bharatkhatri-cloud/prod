const mongoose = require("mongoose");

const bagMixSchema = new mongoose.Schema({
    mixId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    bagIds: [{
        type: String,
        required: true,
        trim: true
    }],
    bagCount: {
        type: Number,
        required: true,
        default: 1
    },
    mixedBy: {
        type: String,
        required: true,
        trim: true
    },
    mixDate: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "EXHAUSTED"],
        default: "ACTIVE"
    },
    totalMouldsFilled: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: "",
        trim: true
    }
});

module.exports = mongoose.model("bagmix", bagMixSchema);
