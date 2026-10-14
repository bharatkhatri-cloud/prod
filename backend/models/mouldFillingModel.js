const mongoose = require("mongoose");


const mouldFillingSchema = new mongoose.Schema({
    bagId: {
        type: String,
        trim: true
    },

    mixId: {
        type: String,
        trim: true,
        index: true
    },

    bagIds: [{
        type: String,
        trim: true
    }],

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
        required: false
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


