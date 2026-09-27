const mongoose = require('mongoose');

const humidifierData = new mongoose.Schema({
    humidifierNo: { // isake andar default value dal ke chor do beacuse from now the humidifer is going to array
        type: String,
        required: true,
        trim: true
    },
    batchId: { // i do not thing this will be required if we are transfering the mould
        type: String,
        required: true,
        trim: true
    },
    // TODO: SemiFinishedGood data, poss risks- OvenIn 
    smFgData: {
        type: [
            {
                // let if i will make it in to another datamodel and i will make the refrence of that data model here in the array
                // will work properly?  can i populate the all data here in the array for every _id/smfgid/something if yes then do it
                smFgId: {
                    type: String,
                    required: true
                },

                // previousStatusTillDeMouldingPieces: {
                //      type: mongoose.Schema.Types.ObjectId,
                //      ref:"DeMouldingPiece",
                //      required: true
                // }

                prevStationInfo: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "mouldfilling",
                    required: true
                },

                scanInTime: {
                    type: Date,
                    default: () => new Date()
                },

                //currently this is look like redundunt with the (removedTime of humiidier) 
                //but this is made for the future mould is trnafer to other humifier
                outTime: {
                    type: Date
                },

                //!for the future if it transfer to other humidifier then 
                //! make it array for the record [H1,to H2,to H3,to ...]
                // humidifierHistory:{
                //}

            }
        ],
        default: []
    },

    //make this array for the record of the with time stamp.....
    // cycles:{ 24 + 48 + 24 ..... whatever
    // }


    placingTime: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    markAsFilledTime: {
        type: Date
    },
    readingsFinishedTime: {
        type: Date
    },
    removedTime: {
        type: Date
    },
    placedBy: { // transfer in to array
        type: String,
        required: true,
        trim: true
    },
    humidityReading: {
        type: [Number],
        default: []
    },
    temperatureReading: {
        type: [Number],
        default: []
    },
    readingTime: {
        type: [Date],
        default: []
    },
    openingTime: { //!  igonre this: transfer to the array
        type: Date
    },
    openedBy: { // tranfer in to array 
        type: String,
        trim: true
    },
    images: {
        type: [String],
        default: []
    },
    growthType: { // i do not thing that it is requrired beascase of the tranfering or move into array 
        type: Number
    }
});

module.exports = mongoose.model('HumidifierData', humidifierData);