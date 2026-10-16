const catchAsyncError = require("../middleware/catchAsyncError");
const MouldFillingModel = require("../models/mouldFillingModel");
const BagMixModel = require("../models/bagMixModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const BagIncubationModel = require("../models/bagIncubationModel");
const MouldIncubationModel = require("../models/mouldIncubationModel");
const TypeOfMouldModel = require("../models/typeOfMouldModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");
const { expandSequentialRange } = require("../utils/rangeHelper");


const mouldDataValidation = catchAsyncError(async (req, res, next) => {
    const filledMouldData = req.body;
    let data = { ...filledMouldData };

    const newMouldIdSet = new Set();
    const duplicateMouldIdSet = new Set();

    // 1. Expand moulds from range if provided
    if (data.mouldStartId && data.mouldEndId) {
        try {
            const rangeMoulds = expandSequentialRange(data.mouldStartId, data.mouldEndId);
            rangeMoulds.forEach(id => newMouldIdSet.add(id));
        } catch (err) {
            return next(new Errorhandler(err.message, 400));
        }
    }

    // 2. Add moulds from array
    if (Array.isArray(data.mould)) {
        data.mould.forEach((currItem) => {
            const mouldId = (typeof currItem === 'object' ? currItem.mouldId : currItem)?.trim();
            if (mouldId) {
                if (newMouldIdSet.has(mouldId)) {
                    duplicateMouldIdSet.add(mouldId);
                } else {
                    newMouldIdSet.add(mouldId);
                }
            }
        });
    }

    // 3. Resolve bags / mix
    let resolvedBagId = data.bagId ? data.bagId.trim() : null;
    let resolvedMixId = data.mixId ? data.mixId.trim() : null;
    let resolvedBagIds = [];

    if (data.startBagId && data.endBagId) {
        try {
            resolvedBagIds = expandSequentialRange(data.startBagId, data.endBagId);
        } catch (err) {
            return next(new Errorhandler(err.message, 400));
        }
    } else if (Array.isArray(data.bagIds) && data.bagIds.length > 0) {
        resolvedBagIds = data.bagIds.map(b => (typeof b === 'object' ? b.bagId : b).trim()).filter(Boolean);
    }

    if (!resolvedMixId && resolvedBagIds.length === 0 && !resolvedBagId) {
        return next(new Errorhandler(`Please provide Bag ID(s) or select an active Mix ID`, 400));
    }

    if (!filledMouldData.filledBy) {
        filledMouldData.filledBy = req.user?.name || "Operator";
    }
    if (!filledMouldData.typeOfMould) {
        return next(new Errorhandler(`Please fill "type of mould"`, 400));
    }

    if (newMouldIdSet.size === 0) {
        return next(new Errorhandler(`Please fill at least one Mould ID or specify a valid Mould Range`, 400));
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
    req.filledMouldData = {
        ...filledMouldData,
        resolvedBagId,
        resolvedMixId,
        resolvedBagIds
    };
    next();
});



const filledNewMould = catchAsyncError(async (req, res, next) => {
    const newMouldIdList = req.newMouldIdList;
    const filledMouldData = req.filledMouldData;
    const filledBy = req.user?.name || filledMouldData.filledBy || "Operator";

    let mixId = filledMouldData.resolvedMixId;
    let bagIds = filledMouldData.resolvedBagIds || [];
    let singleBagId = filledMouldData.resolvedBagId;

    // If a mixId was provided, look it up
    let mixDoc = null;
    if (mixId) {
        mixDoc = await BagMixModel.findOne({ mixId });
        if (!mixDoc) {
            return next(new Errorhandler(`Mix ID "${mixId}" not found.`, 404));
        }
        bagIds = mixDoc.bagIds || [];
    } else if (bagIds.length > 1) {
        // Auto-create a BagMix for this multi-bag mix
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        mixId = `MX-${todayStr}-${randomSuffix}`;
        mixDoc = await BagMixModel.create({
            mixId,
            bagIds,
            bagCount: bagIds.length,
            mixedBy: filledBy,
            mixDate: new Date(),
            status: "ACTIVE",
            totalMouldsFilled: 0,
            notes: `Auto-generated mix for ${newMouldIdList.length} moulds`
        });
    } else if (bagIds.length === 1 && !singleBagId) {
        singleBagId = bagIds[0];
    }

    // Check rejection for bags
    const allCheckedBags = singleBagId ? [singleBagId] : bagIds;
    if (allCheckedBags.length > 0) {
        const rejectedBags = await BagIncubationModel.find({ bagId: { $in: allCheckedBags } });
        if (rejectedBags.length > 0) {
            return next(new Errorhandler(`Cannot use rejected bags: ${rejectedBags.map(b => b.bagId).join(', ')}`, 400));
        }
    }

    // Lookup previous status if single bag
    let previousStatusId = '67612d5180bd61aa82530cb0';
    if (singleBagId) {
        const bagInoc = await BagInoculationModel.findOne({ bagId: singleBagId });
        if (bagInoc) previousStatusId = bagInoc._id.toString();
    } else if (bagIds.length > 0) {
        const firstBagInoc = await BagInoculationModel.findOne({ bagId: bagIds[0] });
        if (firstBagInoc) previousStatusId = firstBagInoc._id.toString();
    }

    const entryData = newMouldIdList.map((currItem) => {
        return {
            bagId: singleBagId || (bagIds.length === 1 ? bagIds[0] : null),
            mixId: mixId || null,
            bagIds: bagIds.length > 0 ? bagIds : (singleBagId ? [singleBagId] : []),
            filledBy: filledBy,
            mouldId: currItem,
            typeOfMould: filledMouldData.typeOfMould,
            fillingId: filledBy,
            fillingDate: new Date(),
            previousStatusTillBagInoculation: previousStatusId
        };
    });

    const newMould = await MouldFillingModel.insertMany(entryData);

    // If associated with a mix, increment count
    if (mixDoc) {
        mixDoc.totalMouldsFilled = (mixDoc.totalMouldsFilled || 0) + newMouldIdList.length;
        await mixDoc.save();
    }

    res.status(201).json({
        success: true,
        message: `${newMouldIdList.length} mould(s) filled successfully${mixId ? ` under Mix "${mixId}"` : ""}.`,
        mixId: mixId || null,
        mouldCount: newMouldIdList.length,
        bagCount: allCheckedBags.length,
        newMould
    });
});


const getMouldData = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;

    const totalDataOfMouldFilled = await MouldFillingModel.countDocuments();

    const apiFeatures = new ApiFeatures(MouldFillingModel.find(), req.query)
        .filter("fillingDate")
        .sort("fillingDate")
        .pagination(resultPerPage);

    const mouldFillingData = (await apiFeatures.query.allowDiskUse(true).populate("previousStatusTillBagInoculation")) || [];

    // Count filtered documents directly via countDocuments instead of loading 200k+ documents into memory
    const countFeatures = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate");
    const totalNoOfDataFiltered = await MouldFillingModel.countDocuments(countFeatures.query.getFilter());

    res.status(200).json({
        success: true,
        message: `Mould Filling Data`,
        totalDataOfMouldFilled: totalDataOfMouldFilled || 0,
        totalNoOfDataFiltered: totalNoOfDataFiltered || 0,
        totalDataShowedOnOnePage: mouldFillingData.length,
        resultPerPage,
        mouldFillingData,
        allFilteredData: mouldFillingData
    });
});



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








