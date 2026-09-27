const mongoose = require("mongoose");


const lcPreparationSchema = new mongoose.Schema({
    lcId: {
        type: String,
        unique:true,
        required: true,
        trim:true
    },
    lcQty: {
        type: Number,
        required: true,
        trim:true
    },
    scId: {
        type: String,
        required: true,
        trim:true
    },
    scQty: {
        type: Number,
        required: true,
        trim:true
    },
  
    lcPreparationTime: { 
        type: Date, 
        default:  () => new Date(),
        required: true,
    },

    lcPreparedBy: {
        type: String,
        required: true,
        trim:true
    },

});

module.exports = mongoose.model("Lcpreparation", lcPreparationSchema); 



// {
//     "lcId":"LC002",
//     "lcQty":600,
//     "scId":"SC0001"
//     "scQty":60,
//     "lcPreparationTime":2024-06-08T04:15:17.442+00:00,
//     "lcPreparedBy":"Ankit Kumar"
//     }



