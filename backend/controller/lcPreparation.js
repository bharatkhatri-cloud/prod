const catchAsyncError = require("../middleware/catchAsyncError")
const LcPreparationModel = require("../models/lcPreparationModel");
const LcRejectionModel = require("../models/lcRejectionModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");



exports.prepareNewLc = catchAsyncError(async (req, res, next) => {
    const lcPreparedBy = req.user.name
    const enteredData = req.body;

    const lcPreparationRecords = enteredData.lcId.map((currLcId) => ({
        lcId: currLcId.toUpperCase(),
        lcQty: enteredData.lcQty,
        scId: enteredData.scId,
        scQty: enteredData.scQty,
        lcPreparedBy,

    }))

    const duplicatesData = await LcPreparationModel.find({ lcId: { $in: enteredData.lcId } });
    if (duplicatesData.length > 0) {
        const duplicateLCIds = duplicatesData.map(currData=>currData.lcId).join(", ")
        return res.status(400).json({ message: `Can't add the LC!! LC ID "${duplicateLCIds} "already exists in the database.` })
    }

    const lcPrepared = await LcPreparationModel.insertMany(lcPreparationRecords)
    res.status(201).json({
        success: true,
        message: "LC Inoculated Successfully",
        lcPrepared
    })

})


exports.getAllDataOfPreparedLc = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;
    const totalLcPreparationData = await LcPreparationModel.countDocuments()


    const apiFeatures = new ApiFeatures(LcPreparationModel.find(), req.query).sort("lcPreparationTime").filter("lcPreparationTime").pagination(resultPerPage);
    const dataOfAllPreparedLc = await apiFeatures.query;

    const apiFeaturesForAllFilteredData = new ApiFeatures(LcPreparationModel.find(), req.query).filter("lcPreparationTime").sort("lcPreparationTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query;
    const totalNoOfDataFiltered = allFilteredData.length;




    if (!dataOfAllPreparedLc) {
        return next(new Errorhandler("Data Of Prepared LC Is Not Found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Data retrieved successfully!",
        totalLcPreparationData,
        totalNoOfDataFiltered: totalNoOfDataFiltered, // Total number of data after filtering
        totalDataShowedOnOnePage: dataOfAllPreparedLc.length, // Total number of data shown on one page
        resultPerPage, 
        dataOfAllPreparedLc,
        allFilteredData 
    })

})


exports.deleteTheDataOfPreparedLc = catchAsyncError(async (req, res, next) => {
    let dataOfPreparedLc = await LcPreparationModel.findById(req.params.id)


    if (!dataOfPreparedLc) {
        return next(new Errorhandler("For this MongoDB Id Data Of Prepared LC Is Not Found", 404));
    }


    let isSelectedLcRejected = await LcRejectionModel.findOne({ lcId: dataOfPreparedLc.lcId })
    if (isSelectedLcRejected) {
        return next(new Errorhandler(`Can't delete LC!! LC ID "${isSelectedLcRejected.lcId}" is Rejected`, 404));
    }


    let isSelectedLcUsedInBagInoculation = await BagInoculationModel.findOne({ JamOrLcId: dataOfPreparedLc.lcId })
    if (isSelectedLcUsedInBagInoculation) {
        return next(new Errorhandler(`Can't delete LC!! LC ID "${isSelectedLcUsedInBagInoculation.JamOrLcId}" is used in Bag Inoculation`, 404));
    }

    await dataOfPreparedLc.deleteOne()
    // db.collectionName.deleteMany({}) to delete all data.


    res.status(202).json({
        success: true,
        message: "Data Of Prepared LC has been Deleted Successfully",
        dataOfPreparedLc
    })

})


exports.updateTheDataOfPreparedLc = catchAsyncError(async (req, res, next) => {
    const dataOfPreparedLc = await LcPreparationModel.findById(req.params.id)
    if (!dataOfPreparedLc) {
        return next(new Errorhandler("For this MongoDB Id Data Of Prepared LC Is Not Found", 404));
    }
    const enteredData = req.body;
    // const updatedDataOfLcPreparation = await LcPreparationModel.findByIdAndUpdate(req.params.id, { ...enteredData, lcPreparationTime: Date.now(), updatedAt: Date.now() }, { new: true })
    // const updatedDataOfLcPreparation = await LcPreparationModel.findByIdAndUpdate(req.params.id, { ...enteredData,  updatedAt: Date.now() }, { new: true })
    const updatedDataOfLcPreparation = await LcPreparationModel.findByIdAndUpdate(
        req.params.id,
        { 
            ...req.body, // Spread the entered data
            $set: { updatedAt: new Date() } // Dynamically set the updatedAt field
        },
        { 
            new: true, // Return the updated document
            runValidators: true, // Validate defined fields
            strict: false // Allow additional fields to be added to the document
        }
    );

    res.status(200).json({
        success: true,
        message: `Data Of Prepared LC Updated Successfully from "${enteredData.lcId}" to "${dataOfPreparedLc.lcId}" `,
        updatedDataOfLcPreparation
    })

})