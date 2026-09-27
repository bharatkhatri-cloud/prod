const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
    dataId: { type: String, required: true, unique: true }, // Unique ID for each data entry
    submittedAt: { type: Date, required: true }, // When timer started
    expiresAt: { type: Date, required: true }, // When it should finish
});

const Timer = mongoose.model("Timer", timerSchema);
module.exports = Timer;
