// Import required modules and middleware
const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const ApiFeatures = require("../utils/Apifeatures");
const ovenModel = require("../models/ovenModel");
const ovenDataModel = require("../models/ovenDataModel");
const HumidifierDataModel = require("../models/humidiferDataModel");


//Todo :- controller for oven.  

// Creates a new oven
const addNewOven = catchAsyncError(async (req, res, next) => {
    const data = req.body;
    // console.log("data",data);
    let oven = await ovenModel.findOne({ 'serialNo': req.body.serialNo });
    if (oven) {
        return next(new Errorhandler(`Oven with given Serial No.(${oven.serialNo}) already exists.`, 403))
    }
    let createdOven = await ovenModel.create(data);
    if (!createdOven) {
        return next(new Errorhandler("Error in Oven creation", 403));
    }
    res.status(201).json({
        success: true,
        message: "Oven created successfully",
        createdOven
    })
})


// Get all Oven
const getAllOven = catchAsyncError(async (req, res, next) => {
    let oven = await ovenModel.find();

    if (!oven) {
        return next(new Errorhandler("No Oven found", 403));
    }
    res.status(202).json({
        message: "Oven data",
        oven
    })
})


// Delete one oven
const deleteOven = catchAsyncError(async (req, res, next) => {
    let oven = await ovenModel.findById(req.params.id);

    if (!oven) {
        return next(new Errorhandler("For Selected MongoDB Id No oven found", 403));
    }

    let deleteResponse
    if (oven.status === "empty") {
        deleteResponse = await oven.deleteOne()
    } else {
        return next(new Errorhandler(`Can't Remove!! Selected Oven ("${oven.serialNo}") is currently '${oven.status}', Oven should be empty`, 403));
    }

    res.status(202).json({
        success: true,
        message: `Oven "${oven.serialNo}" has been deleted successfully`,
        deleteResponse
    })
})


















const middleWareForPieces = catchAsyncError(async (req, res, next) => {
    const enteredData = req.body;



    // Validate input
    if (!Array.isArray(enteredData.smFgIds) || enteredData.smFgIds.length === 0) {
        return next(new Errorhandler("Please input at least one Semi Finish Good Ids", 400));
    }

    // Find IDs that already exist in the oven
    const alreadyInOven = await ovenDataModel.find({ "ovenInSemiFGIds.smFgId": { $in: enteredData.smFgIds } });
    const allPiecesId = alreadyInOven.flatMap(currItem => currItem.ovenInSemiFGIds.map(currItem => currItem.smFgId))

    const foundInOven = enteredData.smFgIds.filter(id => allPiecesId.includes(id));
    const indexOfFoundInOven = foundInOven.map(id => enteredData.smFgIds.indexOf(id) + 1).filter(currIndex => currIndex > 0)

    if (alreadyInOven.length > 0) {
        return next(new Errorhandler(`Can't add!! These ${indexOfFoundInOven.join(", ")}  Semi Finish Goods IDs already In`, 403));
    }


    //TODO: Add a check to see if the moulds are exist in the humidifier (for link just uncomment the part of commented code)
    // const existInHumidifier = await HumidifierDataModel.find({ "smFgData.smFgId": { $in: enteredData.smFgIds } });
    // const allSmFgId = existInHumidifier.flatMap(humidifier => humidifier.smFgData.map(mould => mould.smFgId));
    

    // const notFoundInHumidifier = enteredData.smFgIds.filter(id => !allSmFgId.includes(id));
    // const indexOfNotFoundInHumidifier = notFoundInHumidifier.map(id => enteredData.smFgIds.indexOf(id) + 1).filter(currIndex => currIndex > 0)
    // const idWithIndex = indexOfNotFoundInHumidifier.map(currIndex => ( `${currIndex}. ${enteredData.smFgIds[currIndex-1]}, `))


    // if (idWithIndex.length > 0) {
    //     // console.log(`Can't add!! These ${idWithIndex.join("")} Semi Finish Goods IDs not found in humidifier`);

    //     return next(new Errorhandler(`Can't add!! These ${idWithIndex.join("")} Semi Finish Goods IDs not found in humidifier`, 403));
    // }

    next();


});



const ovenInNewPieces = catchAsyncError(async (req, res, next) => {
    const enteredData = req.body;

    const oven = await ovenModel.findOne({
        $and: [
            { serialNo: enteredData.ovenSerialNo },
        ]
    });


    if (!oven) {
        return next(new Errorhandler(`${enteredData.ovenSerialNo} is not found in the database`), 404)
    }

    
    const ovenInBy = req.user.name;

    //! Find the HumidifierData document containing "each smFgId" to get the correct previous reference
    const humidifierDocs = await HumidifierDataModel.find(
        { "smFgData.smFgId": { $in: enteredData.smFgIds } },
        { _id: 1, "smFgData.smFgId": 1 }
    );

    const smFgToPreviousId = {};
    for (const doc of humidifierDocs) {
        for (const item of doc.smFgData) {
            if (enteredData.smFgIds.includes(item.smFgId)) {
                smFgToPreviousId[item.smFgId] = doc._id;
            }
        }
    }

    const smFgInfo = enteredData.smFgIds.map((currItem) => {
        return {
            smFgId: currItem,
            quality: "N/D",
            inTime: new Date(),
            outTime: "",
            inBy: ovenInBy,
            outBy: "",
            // previous: '676525b1e38118d67a0dedf2' //! humidifier ka batch id (old hardcoded value)
            previous: smFgToPreviousId[currItem] || null
        }

    })

    const batchInfo = oven.batchInfo.find(currItem => currItem.batchId === enteredData.batchIdOfOvenIn)
    const isDataAlreadyExist = await ovenDataModel.findOne({
        $and: [
            { "ovenSerialNo": enteredData.ovenSerialNo },  // Adjusted to match the ovenSerialNo value in the data
            { "batchIdOfOvenIn": enteredData.batchIdOfOvenIn }  // Match batchIdOfOvenIn value
        ]
    });


    if (!batchInfo && !isDataAlreadyExist) {

        const newOvenInData = {
            ovenInSemiFGIds: smFgInfo,
            batchIdOfOvenIn: enteredData.batchIdOfOvenIn,
            ovenSerialNo: enteredData.ovenSerialNo,
            temp: enteredData.temp,
            batchInTime: new Date()
        }

        

        if (!enteredData.temp) {
            return next(new Errorhandler(`Please enter temperature of the batch.`), 404)
        }


        // if only batchId Will works
        const isBatchIdDataAlreadyExist = await ovenDataModel.findOne({
            $and: [
                { "batchIdOfOvenIn": enteredData.batchIdOfOvenIn }  // Match batchIdOfOvenIn value
            ]
        });

        
        if (isBatchIdDataAlreadyExist) {
            return next(new Errorhandler(`${enteredData.batchIdOfOvenIn} already found in the database, Please wait few and try again`), 404)
        }
        
        
        const newCreateBatchData = await ovenDataModel.create(newOvenInData) // creating new data

        const newBatchInfo = {
            batchId: newCreateBatchData.batchIdOfOvenIn,
            dataId: newCreateBatchData._id,
        }
        const updatedOven = await ovenModel.updateOne(
            { serialNo: newOvenInData.ovenSerialNo }, // Filter by the document's serialNo
            {
                $push: { batchInfo: newBatchInfo }, // Add newBatchInfo to batchInfo array
                $set: { status: 'filled' } // Update the status field
            }
        );



        res.status(201).json({
            success: true,
            message: `Added`,
            newCreateBatchData,
            updatedOven
        });

    } else {

        isDataAlreadyExist.ovenInSemiFGIds.push(...smFgInfo);
        const savedData = await isDataAlreadyExist.save();

        const updatedOven = await ovenModel.updateOne(
            { serialNo: enteredData.ovenSerialNo }, // Filter by the document's serialNo
            {
                $set: { status: 'filled' } // Update the status field
            }
        );


        res.status(201).json({
            success: true,
            message: `Added`,
            savedData,
            updatedOven
        });


    }

});



//Todo : Get piece Data from oven batchWise.
const getOvenData = catchAsyncError(async (req, res, next) => {

    // const smFgId = await ovenDataModel.findOne({ batchIdOfOvenIn: req.params.id });
    const resultPerPage = 50;

    const totalDataOfBagRejectedData = await ovenDataModel.countDocuments()

    const apiFeatures = new ApiFeatures(ovenDataModel.find(), req.query).pagination(resultPerPage);
    const dataOfOven = await apiFeatures.query


    if (!dataOfOven) {
        return next(new Errorhandler("For Selected Query Data Of Bag Incubation (Store Room) are not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Data found",
        totalDataOfBagRejectedData,
        dataOfOven
    });

})




const getDataOfOvenBatchWise = catchAsyncError(async (req, res, next) => {

    const {batchIdOfOvenIn,serialNo} = req.query;
    
    const piecesData = await ovenDataModel.find({ $and: [{ batchIdOfOvenIn: batchIdOfOvenIn }, { ovenSerialNo: serialNo }] });

    
    if (piecesData.length === 0) {
        return next(new Errorhandler(`No data is found for batch ID: ${batchIdOfOvenIn}`,404));
    }

    res.status(200).json({
        success: true,
        message: `Data for batch IDs: ${batchIdOfOvenIn}`,
        piecesData
    })

})




//Todo: Remove Moulds ID from oven
const removePieceFromOvenBatchWise = catchAsyncError(async (req, res, next) => {
    const { batchId, serialNo, smFgId } = req.query;

    // Find the oven document by its serial number
    let oven = await ovenDataModel.findOne({
        ovenSerialNo: serialNo,
        batchIdOfOvenIn: batchId,
        ovenInSemiFGIds: { $elemMatch: { smFgId: smFgId } }
    });

    // If oven not found, return an error
    if (!oven) {
        return next(
            new Errorhandler(`No data found for Oven: ${serialNo}, Batch: ${batchId}, and Piece ID: ${smFgId}.`, 404)
        );
    }

    // Perform the update operation to remove the item
    const updateResult = await ovenDataModel.updateOne(
        { ovenSerialNo: serialNo, batchIdOfOvenIn: batchId },
        { $pull: { ovenInSemiFGIds: { smFgId: smFgId } } }
    );

    // If no documents were modified, return an error
    if (updateResult.modifiedCount === 0) {
        return next(
            new Errorhandler(`Failed to remove smFgId: ${smFgId} from the oven.`, 500)
        );
    }

    // Send success response
    res.status(200).json({
        success: true,
        message: `Piece ID: ${smFgId} removed successfully from the oven batch.`,
        updatedCount: updateResult.modifiedCount, // Include number of updated documents
    });
});


//Todo: Remove batch from oven after heat treatment
const batchRemoveFromOven = catchAsyncError(async (req, res, next) => {
    const { batchId, serialNo } = req.query;

    // Check if batch exists in oven
    const batchIdExistInOven = await ovenModel.findOne({
        serialNo: serialNo,
        "batchInfo.batchId": batchId
    });

    if (!batchIdExistInOven) {
        return next(
            new Errorhandler(`For Oven: ${serialNo}, Batch ID: ${batchId} not found.`, 404)
        );
    }

    // Remove the batch info from the oven
    const batchRemoveData = await ovenModel.updateOne(
        { 
            serialNo: serialNo,
            "batchInfo.batchId": batchId
        },
        { 
            $pull: { batchInfo: { batchId: batchId } } 
        }
    );
    const batchDataUpdated = await ovenDataModel.updateOne(
        { 
          ovenSerialNo: serialNo,
          batchIdOfOvenIn: batchId // Correct field name
        },
        { 
          $set: { batchOutTime: new Date() } // Correct Date initialization
        }
      );
      

    if (!batchRemoveData) {
        return next(new Errorhandler("Batch removal failed", 500));
    }

    res.status(200).json({
        success: true,
        message: `Batch ${batchId} removed successfully.`,
        updatedCount: batchRemoveData.modifiedCount, // Number of updated documents
        updatedCountData: batchDataUpdated.modifiedCount, // Number of updated documents
    });
});




const getAllDataOfOvenIn = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 1000;
    const totalOvenInSemiFG = await ovenDataModel.countDocuments();
    const apiFeatures = new ApiFeatures(ovenDataModel.find(), req.query).filter("batchInTime").sort("batchInTime").pagination(resultPerPage);
    const ovenInData = await apiFeatures.query;

    res.status(200).json({
        message: `Data of oven-in`,
        resultPerPage,
        totalCount: ovenInData.length,
        totalOvenInSemiFG,
        ovenInData,
    })
})



module.exports = {
    addNewOven,
    getAllOven,
    deleteOven,
    getAllDataOfOvenIn,
    middleWareForPieces,//checking
    ovenInNewPieces,//new updated add in oven
    getDataOfOvenBatchWise,
    removePieceFromOvenBatchWise,
    batchRemoveFromOven,
    getOvenData,


    getAllDataOfOvenIn,




};





