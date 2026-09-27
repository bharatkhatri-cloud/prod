const catchAsyncError = require("../middleware/catchAsyncError")
const LcRejectionModel = require("../models/lcRejectionModel");
const LcPreparationModel = require("../models/lcPreparationModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");

const rejectNewLcBottle = catchAsyncError(async (req, res, next) => {
    const lcRejectedBy = req.user.name
    const enteredLcData = req.body;

    // ToDo :  checking that LC ID Should exist in our previous record 
    const findingIsLcExistInOurPreviousRecord = await LcPreparationModel.findOne({ lcId: enteredLcData.lcId });
    if (!findingIsLcExistInOurPreviousRecord) {
        return next(new Errorhandler(`This LC ID ${enteredLcData.lcId} Does not exist in our LC Preparation DataBase`, 403));
    }
    console.log("findingIsLcExistInOurPreviousRecord", findingIsLcExistInOurPreviousRecord);



    // ToDo :  checking that LC ID is Already rejected or not
    const isLcAlreadyRejected = await LcRejectionModel.findOne({ lcId: enteredLcData.lcId });
    console.log("isLcAlreadyRejected", isLcAlreadyRejected);

    if (isLcAlreadyRejected) {
        return next(new Errorhandler(`This LC ID ${enteredLcData.lcId} already Rejected`, 404));
    }

    const rejectedLc = await LcRejectionModel.create({ ...enteredLcData, lcRejectedBy, previousStatusTillLCPreparation: findingIsLcExistInOurPreviousRecord._id });

    res.status(201).json({
        success: true,
        message: `LC ID "${rejectedLc.lcId}" rejected successfully with reason of rejection "${rejectedLc.reasonOfRejection}"`,
        rejectedLc
    })
})



const getAllDataOfRejectedLc = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 50;
    const totalLcRejectedData = await LcRejectionModel.countDocuments()


    const apiFeatures = new ApiFeatures(LcRejectionModel.find(), req.query).filter("lcRejectionTime").sort("lcRejectionTime").pagination(resultPerPage);
    const dataOfAllRejectedLc = await apiFeatures.query.populate("previousStatusTillLCPreparation");

    const apiFeaturesForAllFilteredData = new ApiFeatures(LcRejectionModel.find(), req.query).filter("lcRejectionTime").sort("lcRejectionTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query.populate("previousStatusTillLCPreparation");
    const totalNoOfDataFiltered = allFilteredData.length;



    if (!dataOfAllRejectedLc) {
        return next(new Errorhandler(`Data Of Rejected LC Is Not Found`, 404));
    }

    res.status(201).json({
        success: true,
        message: "Data Of Rejected LC",
        totalLcRejectedData,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: dataOfAllRejectedLc.length,
        resultPerPage,
        dataOfAllRejectedLc,
        allFilteredData
    })

})



const deleteTheDataOfRejectedLc = catchAsyncError(async (req, res, next) => {
    let dataOfRejectedLc = await LcRejectionModel.findById(req.params.id)


    if (!dataOfRejectedLc) {
        return next(new Errorhandler("For this MongoDB Id Data Of Rejected LC Is Not Found", 404));
    }

    const deletedDataOfRejectedLC = await dataOfRejectedLc.deleteOne()
    console.log("deletedDataOfRejectedLC",deletedDataOfRejectedLC);
    

    res.status(201).json({
        success: true,
        message: `Data Of Rejected LC ID ("${deletedDataOfRejectedLC.lcId}") has been Deleted Successfully`,
        dataOfRejectedLc
    })

})



const updateTheDataOfRejectedLc = catchAsyncError(async (req, res, next) => {

    // ToDo :  checking MongoDB ID Should exist in our previous record 
    let dataOfRejectedLc = await LcRejectionModel.findById(req.params.id)
    if (!dataOfRejectedLc) {
        return next(new Errorhandler(`For this MongoDB Id Data Of Rejected LC Is Not Found`, 404));
    }


    const enteredLcData = req.body;


    // ToDo :  checking that LC ID Should exist in our previous record 
    const lcShouldExistInOurPreviousRecord = await LcPreparationModel.findOne({ lcId: enteredLcData.lcId });
    if (!lcShouldExistInOurPreviousRecord) {
        return next(new Errorhandler(`This LC ID "${enteredLcData.lcId}" Does not exist in our LC Preparation DataBase`, 404));
    }


    // ToDo :  checking that LC ID Should Reject first  
    const rejectFirstLcBeforeUpdate = await LcRejectionModel.findOne({ lcId: enteredLcData.lcId });
    if (!rejectFirstLcBeforeUpdate) {
        return next(new Errorhandler(`Entered LC ID "${enteredLcData.lcId}" is currently not rejected. It should be rejected first, then you can updated`, 404));
    }


    const updatedDataOfRejectedLc = await LcRejectionModel.findByIdAndUpdate(
        req.params.id,
        {
            ...enteredLcData,
            $set: {updatedAt: new Date()}
        },
        {
            new: true, // Return the updated document
            runValidators: true, // Validate defined fields
            strict: false // Allow additional fields to be added to the document
        }
    );

    res.status(201).json({
        success: true,
        message: `Data Of Rejected LC ("${updatedDataOfRejectedLc.lcId}")has been Updated Successfully from `,
        updatedDataOfRejectedLc
    })

})


module.exports = { rejectNewLcBottle, getAllDataOfRejectedLc, deleteTheDataOfRejectedLc, updateTheDataOfRejectedLc }


