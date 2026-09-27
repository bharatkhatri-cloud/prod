const catchAsyncError = require("../middleware/catchAsyncError")
const HumidifierModel = require("../models/humidiferModel");
const HumidifierDataModel = require("../models/humidiferDataModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");
const upload = require('../middleware/s3');
const MouldFillingModel = require("../models/mouldFillingModel");
const DeMouldingPieceModel = require("../models/deMouldingNewPieceModel");
const TimerModel = require("../models/TimerModel");


// Creates a new humidifier
exports.addHumidifier = catchAsyncError(async (req, res, next) => {
    const data = req.body;
    let humidifier = await HumidifierModel.findOne({ 'serialNo': req.body.serialNo });
    if (humidifier) {
        return next(new Errorhandler(`Humidifier with given Serial No.(${humidifier.serialNo}) already exists.`, 403))
    }
    let createdHumidifier = await HumidifierModel.create(data);
    if (!createdHumidifier) {
        return next(new Errorhandler("Error in humidifier creation", 403));
    }
    res.status(201).json({
        success: true,
        message: "Humidifier created successfully",
        createdHumidifier
    })
})


// Get all humidifiers
exports.getAllHumidifier = catchAsyncError(async (req, res, next) => {
    let humidifiers = await HumidifierModel.find();
    // console.log("humidifiers",humidifiers);

    if (!humidifiers) {
        return next(new Errorhandler("No humidifiers found", 403));
    }
    res.status(202).json({
        message: "Humidifiers data",
        humidifiers
    })
})



// Delete humidifiers
exports.deleteHumidifier = catchAsyncError(async (req, res, next) => {
    let humidifiers = await HumidifierModel.findById(req.params.id);

    if (!humidifiers) {
        return next(new Errorhandler("For Selected MongoDB Id No humidifiers found", 403));
    }

    let deleteResponse
    if (humidifiers.status === "empty") {
        deleteResponse = await humidifiers.deleteOne()
    } else {
        return next(new Errorhandler(`Can't Remove!! Selected Humidifier ("${humidifiers.serialNo}") is currently '${humidifiers.status}', Humidifier should be empty`, 403));
    }

    res.status(202).json({
        success: true,
        message: `Humidifier "${humidifiers.serialNo}" has been deleted successfully`,
        deleteResponse
    })
})



// //TODO: Before Adding pieces to Humidifier checking the existence of pieces IDs
// exports.checkPiecesExistence = catchAsyncError(async (req, res, next) => {

//     const enteredData = req.body;

//     if (!enteredData.smFgIds.length || !enteredData.humidifierNo) {
//         return next(new Errorhandler("Either pieces Ids or Humidifier No is not provided", 400));
//     }

//     // 1.) Check if it exists in de-moulding pieces
//     const foundDeMouldingPieceDocuments = await DeMouldingPieceModel.find({
//         smFgId: { $in: enteredData.smFgIds },
//     }).select('smFgId');

//     // Extract the found smFgIds
//     const foundSmFgIds = foundDeMouldingPieceDocuments.map(doc => doc.smFgId);



//     // Find the smFgIds that are not in the found list
//     const missingSmFgIds = enteredData.smFgIds.filter(id => !foundSmFgIds.includes(id));
//     if (missingSmFgIds.length) {

//         return next(new Errorhandler(`Can't add! Pieces Id : ${missingSmFgIds} doesn't exist in the records of de-moulding Pieces.`, 404));
//     }


//     // Check if it is not present in any batches in humidifier Data
//     const foundDocuments = await HumidifierDataModel.find({
//         "smFgData.smFgId": { $in: enteredData.smFgIds },
//     }).select("smFgData.smFgId");

//     // Extract all existing smFgId from the documents
//     const existingSmFgId = foundDocuments.flatMap(doc =>
//         doc.smFgData.map(mould => mould.smFgId)
//     );

//     // Filter the enteredSmFgIds to find which are already present
//     const alreadyPresentSmFgIds = enteredData.smFgIds.filter(id => existingSmFgId.includes(id));

//     if (alreadyPresentSmFgIds.length) {

//         return next(new Errorhandler(`Can't add!! Pieces ID: ${alreadyPresentSmFgIds} already scanned.`, 302));
//     }
//     const smFgData = foundDeMouldingPieceDocuments.map(currItem => {
//         return {
//             smFgId: currItem.smFgId,
//             previousStatusTillDeMouldingPieces: currItem._id.toString(),
//         }
//     })
//     req.smFgData = smFgData;

//     next()
// })



//TODO: Before Adding pieces to Humidifier checking the existence of mould ids in the mould filing
exports.checkPiecesExistence = catchAsyncError(async (req, _, next) => {

    const enteredData = req.body;

    if (!enteredData.smFgIds.length || !enteredData.humidifierNo) {
        return next(new Errorhandler("Either pieces Ids or Humidifier No is not provided", 400));
    }

    // 1.) Check if it exists in moulding filling
    const foundDeMouldingPieceDocuments = await MouldFillingModel.find({
        mouldId: { $in: enteredData.smFgIds },
    }).select('mouldId');



    // Extract the found smFgIds
    const foundSmFgIds = foundDeMouldingPieceDocuments.map(doc => doc.mouldId);



    // Find the smFgIds that are not in the found list
    const missingSmFgIds = enteredData.smFgIds.filter(id => !foundSmFgIds.includes(id));
    if (missingSmFgIds.length) {

        return next(new Errorhandler(`Can't add! Pieces Id : ${missingSmFgIds} doesn't exist in the records of mould filling department.`, 404));
    }


    // Check if it is not present in any batches in humidifier Data
    const foundDocuments = await HumidifierDataModel.find({
        "smFgData.smFgId": { $in: enteredData.smFgIds },
    }).select("smFgData.smFgId");

    // Extract all existing smFgId from the documents
    const existingSmFgId = foundDocuments.flatMap(doc =>
        doc.smFgData.map(mould => mould.smFgId)
    );

    // Filter the enteredSmFgIds to find which are already present
    const alreadyPresentSmFgIds = enteredData.smFgIds.filter(id => existingSmFgId.includes(id));

    if (alreadyPresentSmFgIds.length) {

        return next(new Errorhandler(`Can't add!! Pieces ID: ${alreadyPresentSmFgIds} already scanned.`, 302));
    }
    const scanInTime = new Date();
    const smFgData = foundDeMouldingPieceDocuments.map(currItem => {
        return {
            smFgId: currItem.mouldId,
            // previousStatusTillDeMouldingPieces: currItem._id.toString(),
            prevStationInfo: currItem._id.toString(),
            scanInTime,
        }
    })
    req.smFgData = smFgData;

    next()
})


//Todo: Add moulds to existing batches or create new batches and then add them (/humidifier/placePieces)
exports.addPiecesToHumidifier = catchAsyncError(async (req, res, next) => {

    const enteredData = req.body;
    const smFgData = req.smFgData;
    const user = req.user.name;


    if (!enteredData.smFgIds.length || !enteredData.humidifierNo) {
        return next(new Errorhandler("Either mould Ids or Humidifier No. is not provided", 400));
    }

    //! get humidfier details
    const humidifier = await HumidifierModel.findOne({ serialNo: enteredData.humidifierNo });
    if (!humidifier) {
        return next(new Errorhandler(`Humidifier ${enteredData.humidifierNo} not found`, 404));
    }


    //! get data placed in the humidifer from refrence which crate between humidifer and humidierData Model. 
    const humidifierData = await HumidifierDataModel.findOne({ _id: humidifier.dataId });


    //! If `humidifierData` is not found, create a new document (`humidifier.dataId` is null or undefined).
    if (!humidifierData) {

        let creationData = {
            humidifierNo: enteredData.humidifierNo,
            batchId: new BatchIDGenerator(enteredData.humidifierNo).generateBatchID(),
            smFgData: smFgData, // from above middleware
            placedBy: user, // from login user
        };
        if (!creationData.batchId) {
            return next(new Errorhandler(`Batch Id is not generated please contact to admin`, 404));
        }

        const newHumidifierData = await HumidifierDataModel.create(creationData);


        //! Increase the humidifier cycle count by 1. (Note: here does not updating status from to empty to semi-fill or something).
        const updatedHumidifier = await HumidifierModel.updateOne(
            { serialNo: enteredData.humidifierNo },
            { $set: { dataId: newHumidifierData._id, cycleCount: Number(humidifier.cycleCount) + 1 } }
        );

        return res.status(201).json({
            success: true,
            message: "Piece IDs!",
            newHumidifierData,
            updatedHumidifier
        });

    } else {
        //! If `humidifierData` is found, only push the mould ID to the array.
        const humidifierData = await HumidifierDataModel.updateOne(
            { _id: humidifier.dataId },
            {
                $push: { smFgData: { $each: smFgData } }
            }
        )

        return res.status(201).json({
            success: true,
            message: "Piece added!!",
            humidifierData
        });


    }

});



//Todo: Get the data currently placed in the humidifier, i.e., all moulds/pieces present in the humidifier.
exports.getDataInHumidifier = catchAsyncError(async (req, res, next) => {
    const dataDocumentId = req.params.id;
  
    //this is not working
    if (!dataDocumentId || dataDocumentId.trim() === "" || typeof dataDocumentId === 'undefined' || dataDocumentId === 'undefined') {
        return next(new Errorhandler("This humidifier is currently empty.", 403));
    }



    let addedMouldsData = await HumidifierDataModel.findById(dataDocumentId);
    if (!addedMouldsData) {
        return next(new Errorhandler("No moulds data exist with given id", 403));
    }


    res.status(201).json({
        message: "Data fetched",
        data: addedMouldsData
    })
})




//Todo: update status from empty to filledCompletely
exports.donePlacingPieces = catchAsyncError(async (req, res, next) => {
    const humidifierID = req.params.id;

    let humidifierToUpdate = await HumidifierModel.findById(humidifierID);

    if (!humidifierToUpdate.dataId) {
        return next(new Errorhandler(`Please fill some pieces in the humidifier first`, 404));
    }
    if (!humidifierToUpdate) {
        return next(new Errorhandler("No Humidifier found  with given id", 403));
    }

    const updatedHumidifier = await HumidifierModel.findByIdAndUpdate(humidifierID, { status: "filledCompletely" }, { new: true });
    await HumidifierDataModel.findByIdAndUpdate(humidifierToUpdate.dataId, { markAsFilledTime: new Date() });
    res.status(201).json({
        message: "Humidifier filled completely!",
        updatedHumidifier
    });
});




//Todo: Add reading data 
exports.addReadingData = catchAsyncError(async (req, res, next) => {
    const dataDocumentId = req.query.id;

    const { humidityReading, temperatureReading } = req.body;

    //Get Humdifier Data Model 
    let addedMouldsData = await HumidifierDataModel.findById(dataDocumentId);
    if (!addedMouldsData) {
        return next(new Errorhandler("No moulds data exist with given id", 403));
    }

    if (!temperatureReading.trim() || !humidityReading.trim()) {
        return next(new Errorhandler("Please fill in both the humidity and temperature readings.", 404));
    }

    // Add new readings to the existing arrays
    if (humidityReading && temperatureReading) {
        addedMouldsData.humidityReading.push(humidityReading);
        addedMouldsData.temperatureReading.push(temperatureReading);
        addedMouldsData.readingTime.push(new Date());
    } else {
        return next(new Errorhandler("Please fill in both the humidity and temperature readings.", 404));
    }

    // Save the updated document
    await addedMouldsData.save();

    res.status(201).json({
        message: "Reading data added successfully! ",
        addedMouldsData
    })
})



//Todo: remove taken reading  
exports.removeReadingData = catchAsyncError(async (req, res, next) => {
    const dataDocumentId = req.query.id;
    const indexNo = parseInt(req.query.indexNo, 10);  // Ensure indexNo is an integer

    let addedMouldsData = await HumidifierDataModel.findById(dataDocumentId);

    if (!addedMouldsData) {
        return next(new Errorhandler("No moulds data exist with given id", 403));
    }

    // Check if index is within bounds
    if (indexNo >= 0 && indexNo < addedMouldsData.readingTime.length) {

        //Remove the element at the specified index
        addedMouldsData.humidityReading.splice(indexNo, 1);
        addedMouldsData.temperatureReading.splice(indexNo, 1);
        addedMouldsData.readingTime.splice(indexNo, 1);

        //Save the updated document
        await addedMouldsData.save();

        res.status(201).json({
            message: `Reading No. ${indexNo + 1} deleted successfully!`,
            addedMouldsData
        });
    } else {
        return next(new Errorhandler("Invalid index", 400));
    }
});




//Todo: After taking all the reading i need to update the status from filledCompletely to readingCollected 
exports.readingsFinished = catchAsyncError(async (req, res, next) => {
    const humidifierID = req.query.id;

    let humidifierToUpdate = await HumidifierModel.findById(humidifierID);

    if (!humidifierToUpdate) {
        return next(new Errorhandler("No Humidifier found  with given id", 403));
    }


    const updatedHumidifier = await HumidifierModel.findByIdAndUpdate(humidifierID, { status: "readingCollected" }, { new: true });
    await HumidifierDataModel.findByIdAndUpdate(humidifierToUpdate.dataId, { readingsFinishedTime: new Date() });

    res.status(201).json({
        message: "You have taken all the readings",
        updatedHumidifier
    });

});






//Todo: Now making humidifier empty 
exports.removePiecesAndUpdateHumidifier = catchAsyncError(async (req, res, next) => {
    // const removePiecesAndUpdateHumidifier = catchAsyncError(async (req, res, next) => {

    const humidifierNo = req.query.id;
    const enteredData = req.body;
    let humidifier = await HumidifierModel.findOne({ serialNo: humidifierNo });



    if (!humidifier) {
        return next(new Errorhandler("No humidifiers found", 403));
    }

    const currentTimestamp = enteredData.outTime ? new Date(enteredData.outTime) : new Date();

    if (humidifier.dataId) {
        await HumidifierDataModel.findByIdAndUpdate(humidifier.dataId, {
            $set: {
                removedTime: currentTimestamp,
                openedBy: req.user.name,
                "smFgData.$[].outTime": currentTimestamp
            }
        });
    }

    const updatedHumidifier = await HumidifierModel.updateOne(
        { serialNo: humidifierNo },
        {
            $unset: { dataId: '' }, // Remove the `dataId` field
            $set: { status: enteredData.status }    // Set `status` to an empty string
        }
    );

    res.status(202).json({
        message: "Updated Humidifier data",
        updatedHumidifier
    })
})



exports.updateOrAddField = catchAsyncError(async (req, res, next) => {
    const id = req.query.id;
    const updateData = req.body;


    if (!id) {
        return next(new Errorhandler("Document ID is required", 400));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        return next(new Errorhandler("At least one field is required", 400));
    }

    let document = await HumidifierDataModel.findById(id);
    if (!document) {
        return next(new Errorhandler("No document exists with the given id", 403));
    }

    // Update or add the fields
    for (let key in updateData) {
        if (updateData.hasOwnProperty(key)) {
            document[key] = updateData[key];
        }
    }

    // Save the updated document
    await document.save();

    res.status(200).json({
        message: "Updated",
        document
    });
});


exports.uploadImages = catchAsyncError(async (req, res, next) => {
    const imageUrl = req.file.location;
    const id = req.query.id;
    // console.log("Req : ",  req)
    let addedMouldsData = await HumidifierDataModel.findById(id);

    // Add new readings to the existing arrays
    if (imageUrl) addedMouldsData.images.push(imageUrl);
    // Save the updated document
    await addedMouldsData.save();

    res.status(200).json({
        message: "Images added successfully! ",
        addedMouldsData
    })
});




exports.getAllHumidifersData = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 5000

    const apiFeatures = new ApiFeatures(HumidifierDataModel.find(), req.query).filter("placingTime").sort("placingTime").pagination(resultPerPage);


    const humidifiersData = await apiFeatures.query;


    if (!humidifiersData) {
        return next(new Errorhandler("Humidifiers data not found", 404));
    }

    res.status(200).json({
        message: "Humidifiers data",
        totalCount: humidifiersData.length,
        humidifiersData,
    })
})



// Fetch Timer Data from DB
exports.getTimerData = async (req, res) => {
    try {
        const { dataId } = req.params;
        const timerData = await TimerModel.findOne({ dataId });

        if (!timerData) {
            return res.status(404).json({ message: "Timer not found" });
        }

        res.json(timerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




class BatchIDGenerator {
    constructor(prefix) {
        this.prefix = prefix;
    }
    generateBatchID() {
        const now = new Date();
        const year = now.getFullYear();
        let month = now.getMonth() + 1; // Months are zero-based, so add 1
        let date = now.getDate();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        month = month < 10 ? `0${month}` : month;
        date = date < 10 ? `0${date}` : date;
        hours = hours < 10 ? `0${hours}` : hours;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${this.prefix}D${date}${month}${year}T${hours}${minutes}`;
    }
}


// module.exports = {
//     checkPiecesExistence
// }