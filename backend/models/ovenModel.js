const mongoose = require("mongoose");

const ovenSchema = new mongoose.Schema({
    serialNo: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    batchInfo: {
        type: [
            {
                //! Here add the time for automatic remove 
                // ! after 3/5 days make a cron job for this
                batchId: {
                    type: String,
                    trim: true
                },
                dataId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "OvenData",
                }
            }
        ],
        default: []
    },
    status: {
        type: String,
        enum: ['empty', 'filled'],
        default: 'empty',
        trim: true,
    }
});

module.exports = mongoose.model("Oven", ovenSchema);



        // {
        //     _id: new ObjectId('678b2b6205347fac988e7852'),
        //     serialNo: 'OVN2',
        //     status: 'empty',
        //     batchInfo: [],
        //     __v: 0
        //   }