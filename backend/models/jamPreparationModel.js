const mongoose = require("mongoose");


const jamPreparationSchema = new mongoose.Schema({
    jamId: {
        type: String,
        unique:true,
        required: true,
        trim:true
    },
    jamQty: {
        type: Number,
        required: true,
        trim:true
    },
    lcId: {
        type: String,
        required: true,
        trim:true
    },
    lcQty: {
        type: Number,
        required: true,
        trim:true
    },
  
    jamPreparationTime: { 
        type: Date, 
        default: () => new Date(),
        required: true,
    },
    jamPreparedBy: {
        type: String,
        required: true,
        trim:true
    },

});

module.exports = mongoose.model("Jampreparation", jamPreparationSchema); 


// {
//         "jamId":"jam0001",
//         "jamQty":"600",
//     "lcId":"LC001",
//     "lcQty":"60",
//      "jamPreparationTime":2024-06-08T04:15:17.442+00:00
//     "jamPreparedBy":"Ankit Kumar"
// }