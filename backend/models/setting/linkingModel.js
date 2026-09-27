const mongoose = require("mongoose");


const linkingSchema = new mongoose.Schema({    
    stageName:{ // Bag Inoculation
        type: String,
        required: true,
        trim: true
    },
    idPrefix:{ // SB
        type: String,
        required: true,
        trim: true
    },
    idLength:{ // 7 
        type: Number
    },
    backLinking:{ // LC Prepration / Jam Preparation
        type: Boolean,
        default:false
    }

});

module.exports = mongoose.model("Linking", linkingSchema); 

