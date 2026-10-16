const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const ApiFeatures = require("../utils/Apifeatures");
const MouldFillingModel = require("../models/mouldFillingModel");


const validationForMouldRejection = catchAsyncError(async (req, res, next) => {
  const enteredMouldData = req.body;

  if (!enteredMouldData.mouldId.length) {
    return next(new Errorhandler(`Please fill at least one mould Id`,404));
  }

  if (!enteredMouldData.mouldRejectionReason.trim()) {
    return next(new Errorhandler(`Please entered reason of rejection`,404));
  }

  const filledMouldData = await MouldFillingModel.find({ mouldId: { $in: enteredMouldData.mouldId } });


  // Get IDs that exist in the database but are not rejected
  const foundMouldIds = filledMouldData.map(currItem => currItem.mouldId);

  // Check for IDs that were not found
  const notFoundId = enteredMouldData.mouldId.map((id, index) => {
    if (!foundMouldIds.includes(id)) {
      return `${index + 1}: ${id}`
    }
  }).filter(curr => curr != undefined);

  if (notFoundId.length > 0) {
    return next(new Errorhandler(`Cannot reject! The following IDs were not found in the Mould Filling Department: ${notFoundId.join(", ")}`,400));
  }


  // Get IDs that are already rejected
  const aleardyRejectedId = filledMouldData
    .filter(currItem => currItem.isMouldRejected)
    .map(currItem => currItem.mouldId);

  // Check for IDs that are already rejected
  const aleardyRejectedIds = enteredMouldData.mouldId.map((id, index) => {
    if (aleardyRejectedId.includes(id)) {
      return `${index + 1}: ${id}`
    }
  }).filter(curr => curr != undefined);

  if (aleardyRejectedIds.length > 0) {
    return next(new Errorhandler(`Cannot reject! The following IDs were already rejected: ${aleardyRejectedIds.join(", ")}`,400));
  }

  next();
  console.log("Mould Rejection Middleware Pass");
});




const rejectNewMould = catchAsyncError(async (req, res, next) => {

  const enteredMouldData = req.body;
  const mouldRejectedBy = req.user.name;

  const rejectedMoulds = await MouldFillingModel.updateMany(
    { mouldId: { $in: enteredMouldData.mouldId } },
    {
      $set: {
        isMouldRejected: true,
        mouldRejectionReason: enteredMouldData.mouldRejectionReason,
        mouldRejectionDate: new Date().toISOString(),
        mouldRejectedBy: mouldRejectedBy,
      },
    }
  )

  if (rejectedMoulds.modifiedCount > 0) {
    return res.status(200).json({
      success: true,
      message: "Moulds rejected successfully",
      rejectedMouldsCount: rejectedMoulds.modifiedCount,
    });
  } else {
    return next("No moulds were updated. Please check your request data.", 400);
  }
})




const rejectMouldsByMixId = catchAsyncError(async (req, res, next) => {
  const { mixId } = req.params;
  const { reasonOfRejection, notes } = req.body;
  const mouldRejectedBy = req.user?.name || "Admin";

  if (!reasonOfRejection || !reasonOfRejection.trim()) {
    return next(new Errorhandler("Please provide a reason for rejecting this mix", 400));
  }

  // Find all unrejected moulds under this mixId
  const targetMoulds = await MouldFillingModel.find({ mixId, isMouldRejected: { $ne: true } });
  if (targetMoulds.length === 0) {
    return next(new Errorhandler(`No active (unrejected) moulds found under Mix "${mixId}".`, 404));
  }

  const mouldIds = targetMoulds.map((m) => m.mouldId);

  // Update all moulds under this mix
  const updateResult = await MouldFillingModel.updateMany(
    { mixId, isMouldRejected: { $ne: true } },
    {
      $set: {
        isMouldRejected: true,
        mouldRejectionReason: reasonOfRejection.trim(),
        mouldRejectionDate: new Date(),
        mouldRejectedBy: mouldRejectedBy,
      },
    }
  );

  // Update BagMix status to QUARANTINED
  const BagMixModel = require("../models/bagMixModel");
  await BagMixModel.findOneAndUpdate(
    { mixId },
    {
      $set: {
        status: "QUARANTINED",
        notes: notes ? `Quarantined: ${notes}` : `Quarantined due to: ${reasonOfRejection.trim()}`,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: `Successfully quarantined and rejected all ${updateResult.modifiedCount} moulds belonging to Mix "${mixId}".`,
    mixId,
    rejectedCount: updateResult.modifiedCount,
    mouldIds,
  });
});

const getRejectedMouldData = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 50;

  const totalDataOfMouldRejected = await MouldFillingModel.countDocuments({ isMouldRejected: true });

  const apiFeatures = new ApiFeatures(MouldFillingModel.find({ isMouldRejected: true }), req.query)
    .filter("mouldRejectionDate")
    .sort("mouldRejectionDate")
    .pagination(resultPerPage);

  const mouldRejectedData = (await apiFeatures.query.allowDiskUse(true).populate("previousStatusTillBagInoculation")) || [];

  const countFeatures = new ApiFeatures(MouldFillingModel.find({ isMouldRejected: true }), req.query).filter("mouldRejectionDate");
  const totalNoOfDataFiltered = await MouldFillingModel.countDocuments(countFeatures.query.getFilter());

  res.status(200).json({
    success: true,
    message: `Rejected Mould Data`,
    totalDataOfMouldRejected,
    totalNoOfDataFiltered: totalNoOfDataFiltered || 0,
    totalDataShowedOnOnePage: mouldRejectedData.length,
    resultPerPage,
    mouldRejectedData,
    allFilteredData: mouldRejectedData,
  });
});


const deleteRejectedMould = catchAsyncError(async (req, res, next) => {

  const enteredMouldId = req.params.id;
  console.log("enteredMouldId", enteredMouldId);

  const filledMouldData = await MouldFillingModel.findOne({ _id: req.params.id });
  if (!filledMouldData) {
    return next(new Errorhandler(`Can't delete!! Mould not filled.`, 404));
  }

  if (!filledMouldData.isMouldRejected) {
    return next(new Errorhandler(`Can't delete!! Mould ID "${filledMouldData.mouldId}" is not rejected at this time.`, 403));
  }


  const rejectedMould = await MouldFillingModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        isMouldRejected: false,
        mouldRejectionReason: '',
        mouldRejectionDate: null,
        mouldRejectedBy: ''
      }
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: `Mould delete (Mould ID: "${rejectedMould.mouldId}") successfully`,
    rejectedMould
  })

})



const updateRjectedMould = catchAsyncError(async (req, res, next) => {

  const enteredData = req.body;

  const filledMouldData = await MouldFillingModel.findById(req.params.id)

  if (!filledMouldData) {
    return next(new Errorhandler("For Selected Id Mould Data not found", 404))
  }


  if (!filledMouldData.isMouldRejected) {
    return next(new Errorhandler(`Can't update!! Mould is not rejected`, 403));
  }


  const rejectedMould = await MouldFillingModel.findByIdAndUpdate(
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
  );

  res.status(201).json({
    success: true,
    message: `Mould updated (Mould ID: "${rejectedMould.mouldId}") successfully`,
    rejectedMould
  })

})




module.exports = { validationForMouldRejection, rejectNewMould, rejectMouldsByMixId, getRejectedMouldData, deleteRejectedMould, updateRjectedMould }; 