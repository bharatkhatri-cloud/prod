const mongoose = require("mongoose");

//! delete this model and fixed all error no longer need this one 
const humidifierSchema = new mongoose.Schema({
    serialNo: {
        type: String,
        unique:true,
        required: true,
        trim:true
    },
    type: {
        type: String,
        required: true,
        trim:true
    },
    cycleCount : {
        type : Number,
        required: true,
        default : 0
    },
    status: {
        type: String,
        enum : ['empty','filledCompletely','readingCollected','clean','maintenance'],
        // empty : Place Mould Button, filledCompletely: Reading Button, readingCollected: Remove Button
        default: 'empty',
        trim:true
    },
    dataId: { // not single make it as a array so that we can make it like 
        type: String,
        trim:true
    }

    //dataIds : {} make it as a array for mould transfering thing
    //dataIds : {} make it as a array for mould transfering thing
    // expireTime or openingTime:{} everytime increses by the that duration whatever duration is requried
});

module.exports = mongoose.model("humidifierSchema", humidifierSchema); 
