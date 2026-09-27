const catchAsyncError = require("../middleware/catchAsyncError")
const BagIncubationModel = require("../models/bagIncubationModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");


exports.getBagIncubationData = catchAsyncError(async (req, res, next) => {
    // Fetch bag incubation data
    const resultPerPage = 50;

    const totalDataOfBagRejectedData = await BagIncubationModel.countDocuments()

    const apiFeatures = new ApiFeatures(BagIncubationModel.find(), req.query).filter("bagRejectionTime").sort("bagRejectionTime").pagination(resultPerPage);
    const dataOfRejectedBag = await apiFeatures.query.populate("previousStatusTillBagInoculation");

    const apiFeaturesForAllFilteredData = new ApiFeatures(BagIncubationModel.find(), req.query).filter("bagRejectionTime").sort("bagRejectionTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query.populate("previousStatusTillBagInoculation");
    const totalNoOfDataFiltered = allFilteredData.length;

    if (!dataOfRejectedBag) {
        return next(new Errorhandler("For Selected Query Data Of Bag Incubation (Store Room) are not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Incubation Bag's Data",
        totalDataOfBagRejectedData,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: dataOfRejectedBag.length,
        resultPerPage,
        dataOfRejectedBag,
        allFilteredData
    });
});



exports.rejectedBag = catchAsyncError(async (req, res, next) => {
    const enteredData = req.body;
    const bagRejectedBy = req.user.name;

    const shouldExistInPrevDb = await BagInoculationModel.findOne({ bagId: enteredData.bagId })
    if (!shouldExistInPrevDb) {
        return next(new Errorhandler(`Entered bag ID ${enteredData.bagId} Does not In our Previous Database (In Bag Inoculation) `, 403));
    }

    const isBagAlreadyRejected = await BagIncubationModel.findOne({ bagId: enteredData.bagId })
    if (isBagAlreadyRejected) {
        return next(new Errorhandler(`Can't Reject!! This Bag Already Rejected ("${isBagAlreadyRejected.bagId}")`, 403));
    }



    const rejectedBagData = await BagIncubationModel.create({ ...enteredData, bagRejectedBy, previousStatusTillBagInoculation: shouldExistInPrevDb._id })

    res.status(201).json({
        success: true,
        message: "Bag Rejected Successfully",
        rejectedBagData
    })
})


exports.updateBagIncubationData = catchAsyncError(async (req, res, next) => {
    const bagIncubationData = await BagIncubationModel.findById(req.params.id)
    if (!bagIncubationData) {
        return next(new Errorhandler("For this MongoDB Id Data Of Rejected bag are Not Found Incubation", 404));
    }

    const enteredData = req.body

    const shouldExistInPrevDb = await BagInoculationModel.findOne({ bagId: enteredData.bagId })
    if (!shouldExistInPrevDb) {
        return next(new Errorhandler(`Entered bag ID ${enteredData.bagId} Does not In our Previous Database (In Bag Inoculation) `, 403));
    }

    // const updatedData = await BagIncubationModel.findByIdAndUpdate(req.params.id,{...enteredData, previousStatusTillBagInoculation: shouldExistInPrevDb,bagRejectionTime:Date.now() } , { new: true })
    const updatedData = await BagIncubationModel.findByIdAndUpdate(
        req.params.id,
        {
            ...enteredData,
            previousStatusTillBagInoculation: shouldExistInPrevDb._id,
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
        message: `Bag rejection data has been updated with Bag ID "${updatedData.bagId}",The new reason for rejection is "${updatedData.reasonOfRejection}". The previous data was Bag ID "${bagIncubationData.bagId}" and the reason for rejection was "${bagIncubationData.reasonOfRejection}".`,
        updatedData
    })
})


exports.deleteBagIncubationData = catchAsyncError(async (req, res, next) => {
    let bagIncubationData = await BagIncubationModel.findById(req.params.id)

    if (!bagIncubationData) {
        return next(new Errorhandler("For this MongoDB Id Data Of Rejected bag are Not Found Incubation", 404));
    }

    const deletedRejectedBagData = await bagIncubationData.deleteOne()

    res.status(201).json({
        message: `Bag ID ${bagIncubationData.bagId} has been deleted successfully. The reason for the bag rejection was ${bagIncubationData.reasonOfRejection}.`,
        deletedRejectedBagData
    })
})