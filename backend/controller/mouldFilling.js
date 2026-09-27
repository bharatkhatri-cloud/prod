const catchAsyncError = require("../middleware/catchAsyncError");
const MouldFillingModel = require("../models/mouldFillingModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const BagIncubationModel = require("../models/bagIncubationModel");
const MouldIncubationModel = require("../models/mouldIncubationModel");
const TypeOfMouldModel = require("../models/typeOfMouldModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");


const mouldDataValidation = catchAsyncError(async (req, res, next) => {
    const filledMouldData = req.body;
    let data = { ...filledMouldData }

    const newMouldIdSet = new Set();
    const duplicateMouldIdSet = new Set();

    data.mould.forEach((currItem) => {
        if (currItem.mouldId.trim() !== "") {
            if (newMouldIdSet.has(currItem.mouldId.trim())) {
                duplicateMouldIdSet.add(currItem.mouldId.trim())
            } else {
                newMouldIdSet.add(currItem.mouldId.trim())
            }
        }
    })

    if (!filledMouldData.bagId) {
        return next(new Errorhandler(`Please fill "bag id"`, 400));
    }

    if (!filledMouldData.filledBy) {
        return next(new Errorhandler(`Please fill "filled by"`, 400));
    }
    if (!filledMouldData.typeOfMould) {
        return next(new Errorhandler(`Please fill "type of mould"`, 400));
    }

    if (newMouldIdSet.size == 0) {
        return next(new Errorhandler(`Please fill at least one Mould ID`, 400));
    }

    if (duplicateMouldIdSet.size > 0) {
        return next(new Errorhandler(`Duplicate Mould ID "${[...duplicateMouldIdSet].join(',')}"`, 409));
    }

    const alreadyFilledMouldData = await MouldFillingModel.find({ mouldId: { $in: [...newMouldIdSet] } });
    const mouldIdList = alreadyFilledMouldData.map((item) => item.mouldId);

    if (mouldIdList.length > 0) {
        return next(new Errorhandler(`Can't add!! Mould ID ${mouldIdList.join(', ')} already filled`, 409));
    }

    req.newMouldIdList = [...newMouldIdSet];
    req.filledMouldData = filledMouldData;
    next();
})



const filledNewMould = catchAsyncError(async (req, res, next) => {
    const newMouldIdList = req.newMouldIdList;
    const filledMouldData = req.filledMouldData;
    const filledBy = req.user.name //
    console.log("filledMouldData",filledMouldData);
    


    const isBagRejected = await BagIncubationModel.findOne({ bagId: filledMouldData.bagId });
    if (isBagRejected) {
        return next(new Errorhandler(`Bag ID "${isBagRejected.bagId}" is already Rejected in Bag Incubation department`, 404));
    }

   


    const shouldExistInPreviousDB = await BagInoculationModel.findOne({ bagId: filledMouldData.bagId })

    if (!shouldExistInPreviousDB) {

        //! for de-link uncomment this 
        const entryData = newMouldIdList.map((currItem) => {
            return {
                bagId: filledMouldData.bagId,
                filledBy: filledMouldData.filledBy,
                mouldId: currItem,
                typeOfMould: filledMouldData.typeOfMould,
                fillingId: filledBy, // Logged-in user ID
                previousStatusTillBagInoculation: '67612d5180bd61aa82530cb0'
            }
        })

        const newMould = await MouldFillingModel.insertMany(entryData);

        res.status(201).json({
            success: true,
            message: `Mould filled successfully.`,
            newMould
        })

        //! for link un-comment this 
        // return next(new Errorhandler(`Bag ID "${filledMouldData.bagId}" not exist in previous data base`, 404));

    }
    else {

        const entryData = newMouldIdList.map((currItem) => {
            return {
                bagId: filledMouldData.bagId,
                filledBy: filledMouldData.filledBy,
                mouldId: currItem,
                typeOfMould: filledMouldData.typeOfMould,
                fillingId: filledBy, // Logged-in user ID
                previousStatusTillBagInoculation: shouldExistInPreviousDB._id.toString()
            }
        })

        const newMould = await MouldFillingModel.insertMany(entryData);


        res.status(201).json({
            success: true,
            message: `Mould filled successfully.`,
            newMould
        })
    }

})


const getMouldData = catchAsyncError(async (req, res) => {
    const resultPerPage = 50;

    const totalDataOfMouldFilled = await MouldFillingModel.countDocuments();

    const apiFeatures = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate").sort("fillingDate").pagination(resultPerPage);
    const mouldFillingData = await apiFeatures.query.populate("previousStatusTillBagInoculation");

    const apiFeaturesForAllFilteredData = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate").sort("fillingDate")
    const allFilteredData = await apiFeaturesForAllFilteredData.query.populate("previousStatusTillBagInoculation");
    const totalNoOfDataFiltered = allFilteredData.length;

    if (!mouldFillingData) {
        return next(new Errorhandler("For Selected Query, Data Is Not Present", 404));
    }

    res.status(201).json({
        success: true,
        message: `Mould Filling Data`,
        totalDataOfMouldFilled,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: mouldFillingData.length,
        resultPerPage,
        mouldFillingData,
        allFilteredData
    })
})



const deleteMouldData = catchAsyncError(async (req, res, next) => {

    const deletingMouldData = await MouldFillingModel.findById(req.params.id)
    if (!deletingMouldData) {
        return next(new Errorhandler("For Selected MongoDB Id Mould Data Is not found", 404))
    }

    let isSelectedMouldRejected = await MouldIncubationModel.findOne({ mouldId: deletingMouldData.mouldId })
    if (isSelectedMouldRejected) {
        return next(new Errorhandler(`Can't delete Mould!! Mould ID "${isSelectedMouldRejected.mouldId}" is Rejected`, 404));
    }

    await deletingMouldData.deleteOne()
    res.status(201).json({
        message: `Data of Mould with ID "${deletingMouldData.mouldId}" and Bag ID "${deletingMouldData.bagId}" has been successfully deleted.`,
    })
})


const updateMouldFillingData = catchAsyncError(async (req, res, next) => {

    const updatingMouldData = await MouldFillingModel.findById(req.params.id)

    if (!updatingMouldData) {
        return next(new Errorhandler("For Selected MongoDB Id Mould Data Is not found", 404))
    }

    const enteredData = req.body;
 
    // const updatedDataOfMouldFilling = await MouldFillingModel.findByIdAndUpdate(req.params.id, { ...enteredData, fillingDate: Date.now() }, { new: true })
    const updatedDataOfMouldFilling = await MouldFillingModel.findByIdAndUpdate(
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
        message: `Mould data has been updated with Mould ID "${enteredData.mouldId}",The new Type Of Mould ID "${enteredData.typeOfMould}". The previous data was Mould ID "${updatingMouldData.mouldId}" and the type of mould for  was "${updatingMouldData.typeOfMould}".`,
        updatedDataOfMouldFilling
    })
})


//! No. Of Bag 
const getNoOfBagUsedInMouldFilling = catchAsyncError(async (req, res, next) => {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    page = Math.max(page, 1); // Ensure at least page 1

    // Count total unique bag IDs after grouping
    const totalNoOfBagUsed = await MouldFillingModel.aggregate([
        {
            $group: { _id: "$bagId" }
        },
        { $count: "total" }
    ]);

    const totalRecords = totalNoOfBagUsed.length > 0 ? totalNoOfBagUsed[0].total : 0;

    // Fetch paginated data
    const noOfBag = await MouldFillingModel.aggregate([
        {
            $group: {
                _id: "$bagId",
                latestEntry: { $first: "$$ROOT" } 
            }
        },
        { $replaceRoot: { newRoot: "$latestEntry" } }, 
        { 
            $project: {
                bagId: 1,
                fillingDate: 1,
                mouldId: 1,
                filledBy: 1
            }
        },
        { $sort: { fillingDate: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);

    res.status(200).json({
        success: true,
        message: `No. bag scanned`,
        totalNoOfBagUsed: totalRecords, // Correct total records count
        noOfBagFetch: noOfBag.length,
        noOfBag,
    });
});




//! Apis For Type Of Mould
const addNewTypeOfMould = catchAsyncError(async (req, res, next) => {
    const enteredData = req.body;
    const typeOfMouldAddedBy = req.user.name
    const isTypeAlreadyExist = await TypeOfMouldModel.findOne({ typeOfMould: enteredData.typeOfMould })
    if (isTypeAlreadyExist) {
        return next(new Errorhandler(`The entered type of mould ("${isTypeAlreadyExist.typeOfMould}") already exists.`, 404))
    }
    const addedNewTypeOfMould = await TypeOfMouldModel.create({ ...enteredData, typeOfMouldAddedBy })
    res.status(201).json({
        success: true,
        message: `The new type of mould ("${addedNewTypeOfMould.typeOfMould}") has been added successfully.`,
        addedNewTypeOfMould
    })
})

const getTypeOfMould = catchAsyncError(async (req, res, next) => {
    const totalTypeOfMould = await TypeOfMouldModel.countDocuments();
    const typeOfMouldData = await TypeOfMouldModel.find();
    res.status(200).json({
        success: true,
        message: `Type of moulds are`,
        totalCount: typeOfMouldData.length,
        totalTypeOfMould,
        typeOfMouldData,
    })

})

const deleteTypeOfMould = catchAsyncError(async (req, res, next) => {
    const deletingTypeOfMouldData = await TypeOfMouldModel.findById(req.params.id)
    if (!deletingTypeOfMouldData) {
        return next(new Errorhandler("For Selected MongoDB Id Type Of Mould Data Is not found", 404))
    }
    await deletingTypeOfMouldData.deleteOne()
    res.status(201).json({
        success: true,
        message: `Type Of Mould ("${deletingTypeOfMouldData.typeOfMould}") has been deleted successfully.`,
    })
})





module.exports = { mouldDataValidation, filledNewMould, getMouldData, deleteMouldData, updateMouldFillingData,getNoOfBagUsedInMouldFilling, addNewTypeOfMould, getTypeOfMould, deleteTypeOfMould };








