const catchAsyncError = require("../middleware/catchAsyncError")
const JamPreparationModel = require("../models/jamPreparationModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");


//! there is no privious link with LC
exports.prepareNewJam = catchAsyncError(async (req, res, next) => {
    const jamPreparedBy = req.user.name;
    const enteredData = req.body;


    if (!Array.isArray(enteredData.jamId) || enteredData.jamId.length === 0) {
        return next(new Errorhandler("Jam IDs must be a non-empty array", 400));
    }

    const isLcAlreadyUse = await JamPreparationModel.findOne({ lcId: enteredData.lcId });
    if (isLcAlreadyUse) {
        return next(new Errorhandler(`Can't add the LC!! LC ID "${isLcAlreadyUse.lcId}" is already used`, 403));
    }

    const jamPreparationRecords = enteredData.jamId.map((jamId) => ({
        jamId,
        jamQty: enteredData.jamQty,
        lcId: enteredData.lcId,
        lcQty: enteredData.lcQty,
        jamPreparedBy,

    }))

    const duplicateJamIds = await JamPreparationModel.find({ jamId: { $in: enteredData.jamId } });
    let duplicateJamIdsArray = duplicateJamIds.map((currItem) => (currItem.jamId)).join(', ');

    if (duplicateJamIds.length > 0) {
        return next(new Errorhandler(`Can't add Jam Id!! Jam Id ${duplicateJamIdsArray} are already added`, 403))
    }

    const jamPrepared = await JamPreparationModel.insertMany(jamPreparationRecords);


    res.status(201).json({
        success: true,
        message: `Jam prepared successfully`,
        jamPrepared
    })

})


exports.getAllDataOfPreparedJam = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;
    const totalDataOfJamPreparation = await JamPreparationModel.countDocuments()
   
    const apiFeatures = new ApiFeatures(JamPreparationModel.find(), req.query).filter("jamPreparationTime").sort("jamPreparationTime").pagination(resultPerPage);
    const dataOfAllPreparedJam = await apiFeatures.query;
    
    const apiFeaturesForAllFilteredData = new ApiFeatures(JamPreparationModel.find(), req.query).filter("jamPreparationTime").sort("jamPreparationTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query;
    const totalNoOfDataFiltered = allFilteredData.length;

    if (!dataOfAllPreparedJam) {
        return next(new Errorhandler("Data Of Prepared Jam Is Not Found", 404));
    }

    res.status(201).json({
        success: true,
        message: "Data Of Prepared Jam",
        totalDataOfJamPreparation,
        totalNoOfDataFiltered:totalNoOfDataFiltered,
        totalDataShowedOnOnePage:dataOfAllPreparedJam.length,
        resultPerPage,
        dataOfAllPreparedJam,
        allFilteredData
    })
})


exports.deleteTheDataOfPreparedJam = catchAsyncError(async (req, res, next) => {
    let dataOfPreparedJam = await JamPreparationModel.findById(req.params.id)
    if (!dataOfPreparedJam) {
        return next(new Errorhandler("For this MongoDB Id Data Of Prepared Jam Is Not Found", 404));
    }

    let isSelectedJamUsedInBagInoculation = await BagInoculationModel.findOne({ JamOrLcId: dataOfPreparedJam.jamId })
    // console.log("isSelectedJamUsedInBagInoculation",isSelectedJamUsedInBagInoculation);
    if (isSelectedJamUsedInBagInoculation) {
        return next(new Errorhandler(`Can't delete Jam!! Jam ID "${isSelectedJamUsedInBagInoculation.JamOrLcId}" is used in Bag Inoculation`, 404));
    }

    await dataOfPreparedJam.deleteOne()
    res.status(201).json({
        success: true,
        message: `Data of Jam ID "${dataOfPreparedJam.jamId}" with LC ID "${dataOfPreparedJam.lcId}" has been deleted successfully.`,
        dataOfPreparedJam
    })

})


exports.updateDataOfPreparedJam = catchAsyncError(async (req, res, next) => {

    let dataOfPreparedJam = await JamPreparationModel.findById(req.params.id)


    if (!dataOfPreparedJam) {
        return next(new Errorhandler("For this MongoDB Id Data Of Prepared Jam Is Not Found", 404));
    }

    const enteredData = req.body;
    const updatedDataOfJamPreparation = await JamPreparationModel.findByIdAndUpdate(
        req.params.id,
        { 
            ...enteredData,
            $set:{updatedAt:new Date()}
        }, 
        { 
            new: true ,
            runValidators: true,
            strict: false
        }
    )

    res.status(201).json({
        success: true,
        message: `Data Of Prepared Jam Updated Successfully from "${enteredData.jamId}" to "${dataOfPreparedJam.jamId}" `,
        updatedDataOfJamPreparation
    })

})