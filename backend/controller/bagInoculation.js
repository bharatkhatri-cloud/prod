const catchAsyncError = require("../middleware/catchAsyncError")
const BagInoculationModel = require("../models/bagInoculationModel");
const LcRejectionModel = require("../models/lcRejectionModel");
const LcPreparationModel = require("../models/lcPreparationModel");
const JamPreparationModel = require("../models/jamPreparationModel");
const BagIncubationModel = require("../models/bagIncubationModel");
const MouldFillingModel = require("../models/mouldFillingModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");



exports.getBagInoculatedData = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;

    const totalDataOfBagInoculation = await BagInoculationModel.countDocuments()

    const apiFeatures = new ApiFeatures(BagInoculationModel.find(), req.query).filter("inoculationTimeStamp").sort("inoculationTimeStamp").pagination(resultPerPage);
    const dataOfBagInoculation = await apiFeatures.query.populate("previousStatusTillJamOrLCPreparation");;

    const apiFeaturesForAllFilteredData = new ApiFeatures(BagInoculationModel.find(), req.query).filter("inoculationTimeStamp").sort("inoculationTimeStamp")
    const allFilteredData = await apiFeaturesForAllFilteredData.query;
    const totalNoOfDataFiltered = allFilteredData.length;


    if (!dataOfBagInoculation) {
        return next(new Errorhandler("Bag inoculation data not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Data of Inoculated Bag",
        totalDataOfBagInoculation,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: dataOfBagInoculation.length,
        resultPerPage,
        dataOfBagInoculation,
        allFilteredData
    })
})


exports.createBagInoculation = catchAsyncError(async (req, res, next) => {
    const inoculatedBy = req.user.name;
    const enteredData = req.body;

    // Check if bagId is provided and is an array
    if (!Array.isArray(enteredData.bagId) || enteredData.bagId.length === 0) {
        return next(new Errorhandler("Bag IDs must be a non-empty array", 400));
    }

    // Check if the LC or Jam ID is rejected
    const isLcRejected = await LcRejectionModel.findOne({ lcId: enteredData.JamOrLcId });
    if (isLcRejected) {
        return next(new Errorhandler(`Can't add the LC!! LC ID "${isLcRejected.lcId}" is already rejected`, 403));
    }

    // Check for duplicate bag IDs in the database
    const duplicateBagIds = await BagInoculationModel.find({
        bagId: { $in: enteredData.bagId }
    });
    if (duplicateBagIds.length > 0) {
        const duplicateIds = duplicateBagIds.map(bag => bag.bagId).join(", ");
        return next(new Errorhandler(`Can't add the bags!! Bag IDs "${duplicateIds}" are already inoculated`, 403));
    }

    //Get some info after checking back-linking.
    const previousStatusData = req.bagInoculationLinking.prevStatus || {};

    // Map through bag IDs to create individual records.
    const bagInoculationRecords = enteredData.bagId.map(bagId => ({
        bagId,
        bagQty: parseFloat(enteredData.bagQty),
        JamOrLcId: enteredData.JamOrLcId,
        JamOrLcQty: parseFloat(enteredData.JamOrLcQty),
        inoculatedBy,
        ...previousStatusData,
        remark: enteredData.remark,
    }));


    // Save all records to the database
    const insertedRecords = await BagInoculationModel.insertMany(bagInoculationRecords);

    res.status(201).json({
        success: true,
        message: `The bags have been inoculated successfully.`,
        insertedRecords
    });
});




exports.updateBagInoculatedData = catchAsyncError(async (req, res, next) => {
    const bagInoculatedData = await BagInoculationModel.findById(req.params.id)

    if (!bagInoculatedData) {

        return next(new Errorhandler("Bag inoculation data not found", 404));
    }
    const enteredData = req.body;

    //!Previous status
    const lcPreparation = await LcPreparationModel.findOne({ lcId: enteredData.JamOrLcId });
    const jamPreparation = await JamPreparationModel.findOne({ jamId: enteredData.JamOrLcId });

    if (!lcPreparation && !jamPreparation) {
        // return next(new Errorhandler(`Cannot update. The entered LC/Jam ID "${enteredData.JamOrLcId}" does not exist in our previous records`, 403));
        lcPreparation = await LcPreparationModel.findOne({ lcId: 'LC NA' });
    }

    let previousStatusData = {};
    if (lcPreparation) {
        previousStatusData = {
            previousStatusTillJamOrLCPreparation: lcPreparation._id,
            previousStatusModel: 'Lcpreparation'
        };
    } else if (jamPreparation) {
        previousStatusData = {
            previousStatusTillJamOrLCPreparation: jamPreparation._id,
            previousStatusModel: 'Jampreparation'
        };
    }



    // const updatedData = await BagInoculationModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    const updatedDataOfBagInoculation = await BagInoculationModel.findByIdAndUpdate(
        req.params.id,
        {
            ...enteredData,
            ...previousStatusData,
            $set: { updatedAt: new Date() }
        },
        {
            new: true,
            runValidators: true,
            strict: false
        }
    )

    res.status(201).json({
        success: true,
        message: `Data with LC/Jam Id "${updatedDataOfBagInoculation.JamOrLcId}" and Bag Id "${updatedDataOfBagInoculation.bagId}" has been updated successfully.`,
        updatedDataOfBagInoculation
    })
})
// updateBagInoculatedData()

exports.deleteBagInoculatedData = catchAsyncError(async (req, res, next) => {
    let bagInoculatedData = await BagInoculationModel.findById(req.params.id)


    if (!bagInoculatedData) {
        return next(new Errorhandler("Bag inoculation data not found", 404));
    }


    let isSelectedBagRejected = await BagIncubationModel.findOne({ bagId: bagInoculatedData.bagId })
    if (isSelectedBagRejected) {
        return next(new Errorhandler(`Can't delete Bag!! Bag ID "${isSelectedBagRejected.bagId}" is Rejected`, 404));
    }


    let isSelectedBagUsedInMouldFilling = await MouldFillingModel.findOne({ bagId: bagInoculatedData.bagId })
    if (isSelectedBagUsedInMouldFilling) {
        return next(new Errorhandler(`Can't delete Bag!! Bag ID "${isSelectedBagUsedInMouldFilling.bagId}" is used in Mould Filling`, 404));
    }



    await bagInoculatedData.deleteOne()
    res.status(201).json({
        message: `Bag with ID "${bagInoculatedData.bagId}" and LC/Jam ID "${bagInoculatedData.JamOrLcId}" has been successfully deleted.`,
    })
})


exports.getSingleBagInoculationData = catchAsyncError(async (req, res, next) => {

    const { bagId } = req.params;
    const bagInoculatedData = await BagInoculationModel.findOne({ bagId });

    if (!bagInoculatedData) {
        return res.status(200).json({
            success: true,
            message: `Bag ID ${bagId} does not exist.`,
        });
    }


    res.status(400).json({
        success: false,
        bagInoculatedData,
    });

})