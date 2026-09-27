const mongoose = require("mongoose");


const bagIncubationSchema = new mongoose.Schema({    
    bagId: {
        type: String,
        unique:true,
        required: true,
        trim:true
    },

    reasonOfRejection: {
        type: String,
        required: true,
        trim:true
    },
    
    bagRejectedBy: {
        type: String,
        required: true,
        trim:true
    },
    bagRejectionTime: {
        type: Date, 
        default: () => new Date(),
        required: true,
    },
    previousStatusTillBagInoculation:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"BagInoculation",
        required: true
    }   

});

module.exports = mongoose.model("Bagincubation", bagIncubationSchema); 

