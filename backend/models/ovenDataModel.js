const mongoose = require("mongoose");

const ovenInSchema = new mongoose.Schema({
  batchIdOfOvenIn: {
    type: String,
    unique: true,
    required: true
  },
  ovenSerialNo: {
    type: String,
    required: true
  },
  temp:{
    type: String,
    required: true
  },
  batchInTime:{
    type: Date,
    required: true
  },
  batchOutTime:{
    type: Date,
  },
  ovenInSemiFGIds: {
    type: [
      {
        smFgId: {
          type: String,
          trim: true,
        },
        quality: {
          type: String,
          enum: ["T2", "TC", "T3","N/D"],
          default:"N/D",
          trim: true,
        },
        inTime: {
          type: Date, 
        },
        outTime: {
          type: Date,
        },
        inBy: {
          type: String, //! from login 
          trim: true
        },
        outBy: {
          type: String,
          trim: true
        },
        previous: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'HumidifierData',
        },
      }
    ],
    default: []
  }
});

module.exports = mongoose.model("OvenData", ovenInSchema);


  // const enteredData = {
    //     smFgIds: [
    //         // available in oven
    //         "DM002496", "DM002497", "DM002513", "DM002482", "DM002513", "DM002513", 
    //         // "DM002513", "DM002493", "DM002514", "DM002540",
    //         // "DM0024965XX", "DM002496XXXX", "DM002496XXX", //Not available
    //         "DM002575", "DM002560", //"DM002543",
    //         "DM002579", //"DM002574"

    //     ],
    //     batchIdOfOvenIn: "OVN1D04012025T1020",
    //     ovenSerialNo: "OVN2",

    // }




// //for new requremnt
// const ovenInBatchSchema = new mongoose.Schema({
//   ovenSerialNo: {
//     type: String,
//     required: true
//   },
//   batchIdOfOvenIn: {
//     type: String,
//     unique: true,
//     required: true
//   },

//   temp:{
//     type: String,
//     required: true
//   },
//   batchInTime:{
//     type: Date,
//     required: true
//   },
//   batchOutTime:{
//     type: Date,
//   },
//   batchInBy:{
//     type: String,
//   },
  
//   batchOutBy:{
//     type: String,
//   },
// });

// module.exports = mongoose.model("OvenInBatch", ovenInBatchSchema);




// fgData
//       {
//         // i am renaming this from smFgId to fgId
//         //use transctiong during the data migrantion...
//         fgId: {
//           type: String,
//           trim: true,
//         },
//         quality: {
//           type: String,
//           enum: ["T2", "TC", "T3","N/D"],
//           default:"N/D",
//           trim: true,
//         },
//         inTime: {
//           type: Date, 
//         },
//         //scan in the ovenOut
//         //scan during quality qulification
//         outTime: {

//           type: Date,
//         },
//         inBy: {
//           type: String, //! from login 
//           trim: true
//         },
//         outBy: {
//           type: String,
//           trim: true
//         },
//         previous: {
//           type: mongoose.Schema.Types.ObjectId, 
//           ref: 'smfgid',
//           ref: 'smfgData',
//         },
//       }

//   }