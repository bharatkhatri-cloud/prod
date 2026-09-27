const mongoose = require("mongoose");

const bagInoculationSchema = new mongoose.Schema({
    bagId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bagQty: {
        type: Number,
        required: true,
        trim: true
    },
    JamOrLcId: { 
        type: String,
        required: true,
        trim: true
    },
    JamOrLcQty: {
        type: Number,
        required: true,
        trim: true
    },
    inoculationTimeStamp: {
        type: Date, 
        default: () => new Date(),
        required: true
    },
    inoculatedBy: {
        type: String,
        required: true,
        trim: true
    },
    previousStatusTillJamOrLCPreparation: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'previousStatusModel'
    },
    previousStatusModel: {
        type: String,
        required: true,
        enum: ['Lcpreparation', 'Jampreparation']
    },
    remark: { 
        type: String,
        trim: true
    },
});

module.exports = mongoose.model("BagInoculation", bagInoculationSchema);


// {
//     "inoculatedByJamOrLc":"Jam",
//     "JamOrLcId":"jam001",
//     "JamOrLcQty":"600ml",
//     "bagId":"SB0001",
//     "bagQty":"60ml",
//     "inoculatedBy":"Ankit Kumar"
// }