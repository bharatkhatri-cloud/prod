const mongoose = require("mongoose");


const mouldFillingSchema = new mongoose.Schema({
    bagId: {
        type: String,
        required: true,
        trim: true
    },

    filledBy: {
        type: String,
        required: true,
        trim: true
    },
    
    mouldId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    typeOfMould: {
        type: String,
        required: true,
        trim: true
    },

    
    fillingDate: {
        type: Date,
        default: ()=> new Date(),
        required: true
    },
    
    fillingId:{
        type: String,
        required: true,
        trim: true
    },
    previousStatusTillBagInoculation: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"BagInoculation",
        required: true
    },
    isMouldRejected:{
        type:Boolean,
        default:false
    },
    mouldRejectionReason:{
        type:String,
        default:"",
        trim:true

    },
    mouldRejectionDate:{
        type:Date,
        default: null,
    },
    mouldRejectedBy:{
        type:String,
        default:"",
    }

})

module.exports = mongoose.model("mouldfilling", mouldFillingSchema); 


