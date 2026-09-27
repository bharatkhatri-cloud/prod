const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const ApiFeatures = require("../utils/Apifeatures");
const MouldFillingModel = require("../models/mouldFillingModel");
const MouldIncubationModel = require("../models/mouldIncubationModel");
const DeMouldingRejectionModel = require("../models/deMouldingRejectionModel");
const DeMouldingPieceModel = require("../models/deMouldingNewPieceModel");

// export const rejectNewDeMould = catchAsyncError(async (req, res, next) => {
exports.rejectNewDeMould = catchAsyncError(async (req, res, next) => {
    const filledDeMouldData = req.body;
    const deMouldingRejectedBy = req.user.name

    if (!filledDeMouldData.rejectedDeMouldId) {
        return next(new Errorhandler(`Please Fill De-Moulded Mould ID`, 404));
    }

    const isDeMouldAlreadyRejected = await DeMouldingRejectionModel.findOne({ rejectedDeMouldId: filledDeMouldData.rejectedDeMouldId });
    if (isDeMouldAlreadyRejected) {
        return next(new Errorhandler(`De-Moulded Mould ID "${isDeMouldAlreadyRejected.rejectedDeMouldId}" is already rejected`, 302));
    }

    const shouldExistInPreviousDB = await MouldFillingModel.findOne({ mouldId: filledDeMouldData.rejectedDeMouldId });
    if (!shouldExistInPreviousDB) {
        return next(new Errorhandler(`Enter Mould ID "${filledDeMouldData.rejectedDeMouldId}" does not exist in our previous record(In Mould Filling)`, 404));
    }

    const shouldNotRejectedInPrivDB = await MouldIncubationModel.findOne({ mouldId: filledDeMouldData.rejectedDeMouldId });
    if (shouldNotRejectedInPrivDB) {
        return next(new Errorhandler(`Enter Mould ID "${shouldNotRejectedInPrivDB.mouldId}" is already rejected in (In Mould Store Room)`, 302));
    }

    const shouldNotScanNextStage = await DeMouldingPieceModel.findOne({ mouldId: filledDeMouldData.rejectedDeMouldId });
    if (shouldNotScanNextStage) {
        return next(new Errorhandler(`Enter Mould ID "${shouldNotScanNextStage.mouldId}" Scanned in DeMoulding Piece department`, 302));
    }


    const rejectNewDeMould = await DeMouldingRejectionModel.create({ ...filledDeMouldData, deMouldingRejectedBy, previousDetailsTillMouldFilling: shouldExistInPreviousDB._id });

    res.status(201).json({
        success: true,
        message: `Mould Rejected successfully with Mould ID ${rejectNewDeMould.rejectedDeMouldId}`,
        rejectNewDeMould
    })
})


exports.getRejectedDeMoldData = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 50; // Number of items per page

    const totalRejectedDeMould = await DeMouldingRejectionModel.countDocuments();

    // Apply filtering, sorting, and pagination
    const apiFeatures = new ApiFeatures(DeMouldingRejectionModel.find(), req.query).filter("rejectedDeMouldingTime").sort("rejectedDeMouldingTime").pagination(resultPerPage);

    // Query the database and populate fields
    const rejectedDeMouldData = await apiFeatures.query
        .populate({
            path: "previousDetailsTillMouldFilling",
            populate: {
                path: "previousStatusTillBagInoculation",
                populate: {
                    path: "previousStatusTillJamOrLCPreparation",
                },
            },
        })
        .exec();


    const apiFeaturesForAllFilteredData = new ApiFeatures(DeMouldingRejectionModel.find(), req.query).filter("rejectedDeMouldingTime").sort("rejectedDeMouldingTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query
        .populate({
            path: "previousDetailsTillMouldFilling",
            populate: {
                path: "previousStatusTillBagInoculation",
                populate: {
                    path: "previousStatusTillJamOrLCPreparation",
                },
            },
        })
        .exec();
    const totalNoOfDataFiltered = allFilteredData.length;


    // Send the response
    res.status(200).json({
        success: true,
        message: `Data of Rejected De-Moulding retrieved successfully`,
        totalRejectedDeMould,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: rejectedDeMouldData.length,
        resultPerPage,
        rejectedDeMouldData,
        allFilteredData
       
    });

});



exports.deleteRejectedDeMouldData = catchAsyncError(async (req, res, next) => {
    const deleteRejectedDeMouldData = await DeMouldingRejectionModel.findById(req.params.id)
    if (!deleteRejectedDeMouldData) {
        return next(new Errorhandler("For Selected MongoDB Id De-Mould Data Is not found", 404))
    }
    await deleteRejectedDeMouldData.deleteOne()
    res.status(201).json({
        message: `Data of De-Mould with ID "${deleteRejectedDeMouldData.rejectedDeMouldId}" has been successfully deleted.`,
    })
})

