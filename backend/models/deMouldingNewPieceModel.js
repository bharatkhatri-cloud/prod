const mongoose = require("mongoose");

const deMouldingPieceSchema = new mongoose.Schema({
    mouldId:{
        type: String,
        unique:true,
        required: true,
        trim: true
    },
    smFgId: {
        type: String,
        unique:true,
        trim: true
    },
    deMouldingPieceTime: {
        type: Date,
        default: () => new Date(), 
        required: true,
    },
    pieceDeMouldedBy:{
        type: String,
        trim: true
    },
    previousStatusTillMouldFilling: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"mouldfilling",
        required: true
    }
});

module.exports = mongoose.model("DeMouldingPiece", deMouldingPieceSchema);