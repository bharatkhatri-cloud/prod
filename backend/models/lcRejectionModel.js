const mongoose = require("mongoose");


const lcRejectionSchema = new mongoose.Schema({
    lcId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    reasonOfRejection: {
        type: String,
        required: true,
        trim: true
    },

    lcRejectionTime: {
        type: Date,
        default: ()=> new Date(),
        required: true, 
    },

    lcRejectedBy: {
        type: String,
        required: true,
        trim: true
    },

    previousStatusTillLCPreparation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lcpreparation",
        required: true
    }

});

module.exports = mongoose.model("Lcrejection", lcRejectionSchema);


// {
//         "lcId":"LC001",
//         "reasonOfRejectionTime":"600ml",
//     "lcRejectedBy":"Ankit Kumar",
// }