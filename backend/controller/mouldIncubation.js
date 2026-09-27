const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const MouldIncubationModel = require("../models/mouldIncubationModel");
const MouldFillingModel = require("../models/mouldFillingModel");
const ApiFeatures = require("../utils/Apifeatures");

const rejectNewMould = catchAsyncError(async (req, res, next) => {
    const enteredMouldData = req.body;
    const mouldRejectedBy = req.user.name;


    const isMouldAlreadyRejected = await MouldIncubationModel.findOne({ mouldId: enteredMouldData.mouldId });
    if (isMouldAlreadyRejected) {
        return next(new Errorhandler(`Mould ID "${isMouldAlreadyRejected.mouldId}" is already rejected`, 404));
    }


    const filledMouldData = await MouldFillingModel.findOne({ mouldId: enteredMouldData.mouldId });
    if (!filledMouldData) {
        return next(new Errorhandler(`Can't reject!! Mould ID "${enteredMouldData.mouldId}" not filled in Mould filling department.`, 404));
    }

    const rejectedMould = await MouldIncubationModel.create({ ...enteredMouldData, mouldRejectedBy, previousDetailsTillMouldFilling: filledMouldData._id });

    res.status(201).json({
        success: true,
        message: `Mould Rejected (Mould ID: "${rejectedMould.mouldId}") successfully`,
        rejectedMould
    })


})


const getRejectedMoldData = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;

    const totalDataOfRejectedMould = await MouldIncubationModel.countDocuments();

    const apiFeatures = new ApiFeatures(MouldIncubationModel.find(), req.query).filter("rejectionTime").sort("rejectionTime").pagination(resultPerPage);
    const mouldRejectedData = await apiFeatures.query.populate("previousDetailsTillMouldFilling");

    const apiFeaturesForAllFilteredData = new ApiFeatures(MouldIncubationModel.find(), req.query).filter("rejectionTime").sort("rejectionTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query.populate("previousDetailsTillMouldFilling");
    const totalNoOfDataFiltered = allFilteredData.length;

    if (!mouldRejectedData.length) {
        return next(new Errorhandler("For Selected Query, Data Is Not Present", 404));
    }

    res.status(201).json({
        success: true,
        message: `Data fetch successfully`,
        totalDataOfRejectedMould,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: mouldRejectedData.length,
        resultPerPage,
        mouldRejectedData,
        allFilteredData
    })
})



const deleteRejectedMouldData = catchAsyncError(async (req, res, next) => {

    const deleteRejectedMouldData = await MouldIncubationModel.findById(req.params.id)


    if (!deleteRejectedMouldData) {
        return next(new Errorhandler("For Selected Id Mould Data Is not found", 404))
    }

    await deleteRejectedMouldData.deleteOne()

    res.status(201).json({
        message: `Data of Mould with ID "${deleteRejectedMouldData.mouldId}" has been successfully deleted.`,
    })
})


const updateRejectedMouldFillingData = catchAsyncError(async (req, res, next) => {

    const findingRejectMouldData = await MouldIncubationModel.findById(req.params.id)

    if (!findingRejectMouldData) {
        return next(new Errorhandler("For Selected mongodb ID Data Is not found", 404))
    }

    const enteredData = req.body;


    if (enteredData.mouldId !== findingRejectMouldData.mouldId) {

        return next(new Errorhandler("You can't changes mould ID b/z, it does not exist in our previous records.", 403))
    }

    // const updatedDataOfRejectedMould = await MouldIncubationModel.findByIdAndUpdate(req.params.id, { ...enteredData, rejectionTime: Date.now() }, { new: true })
    const updatedDataOfRejectedMould = await MouldIncubationModel.findByIdAndUpdate(
        req.params.id,
        {
            ...enteredData,
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
        message: `For Mould ID "${enteredData.mouldId}",The new reason of rejection is "${enteredData.reasonOfRejection}". The previous reason of rejection was "${findingRejectMouldData.reasonOfRejection}".`,
        updatedDataOfRejectedMould
    })
})

module.exports = { rejectNewMould, getRejectedMoldData, deleteRejectedMouldData, updateRejectedMouldFillingData };