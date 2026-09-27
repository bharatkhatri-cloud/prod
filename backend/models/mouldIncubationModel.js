const mongoose = require("mongoose") 

const moldIncubationSchema = new mongoose.Schema({
    mouldId:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    reasonOfRejection:{
        type: String,
        required: true,
        trim: true
    },
    rejectionTime:{
        type: Date,
        default: () => new Date(),
        required: true
    },
    
    mouldRejectedBy:{
        type: String,
        required: true,
        trim: true
    },
    
    previousDetailsTillMouldFilling:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"mouldfilling",
        required: true
    }

})

module.exports = new mongoose.model("Moldincubation",moldIncubationSchema)