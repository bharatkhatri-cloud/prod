const mongoose = require("mongoose");

const rejectedDeMouldingSchema = new mongoose.Schema({
    rejectedDeMouldId: {
        type: String,
        unique: true,
        required: true
    },
    rejectionReason:{
        type:String,
        default:"Piece broke during de-moulding.",
        required:true,
    },
    rejectedDeMouldingTime: {
        type: Date,
        default: () => new Date(),
        required: true,
        trim: true
    },
    deMouldingRejectedBy: {
        type: String,
        required: true,
        trim: true
    },
    previousDetailsTillMouldFilling:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"mouldfilling",
        required: true
    }
});

module.exports = mongoose.model("RejectedDeMouldings", rejectedDeMouldingSchema);
