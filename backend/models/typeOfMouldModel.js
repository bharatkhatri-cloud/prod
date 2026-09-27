const mongoose = require("mongoose");

const typeOfMouldSchema = new mongoose.Schema({
    typeOfMould: {
        type: String,
        unique: true,
        required: true
    },
    typeOfMouldAddedBy: {
        type: String,
        required: true
    },
    typeOfMouldAddingTime: {
        type: Date,
        default: ()=> new Date(),
        required: true, 
    }
});

module.exports = mongoose.model("Typeofmould", typeOfMouldSchema);