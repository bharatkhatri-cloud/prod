const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const ovenDataModel = require("../models/ovenDataModel");
const ApiFeatures = require("../utils/Apifeatures");

const middlewareForOvenOutFg = catchAsyncError(async (req, res, next) => {
    const filledData = req.body;
    const enteredData = {
        outTime: new Date(),
        outBy: req.user?.name || "Dharaksha Team",
        quality: filledData.quality,
        fgId: filledData.fgId
    }

    const isEnteredFgIdExist = await ovenDataModel.find({ "ovenInSemiFGIds.smFgId": { $in: enteredData.fgId } })

    // checking if  fg id is already scan in oven out
    const alreadyScanFgId = isEnteredFgIdExist.flatMap(currData => currData.ovenInSemiFGIds.map((currItem) => {
        if (enteredData.fgId.indexOf(currItem.smFgId) > -1 && currItem.quality !== "N/D") {
            return `${enteredData.fgId.indexOf(currItem.smFgId) + 1}. ${currItem.smFgId} with Type Of FG ("${currItem.quality}"), `
        }
    }).filter(item => item !== undefined))

    
    if (alreadyScanFgId.length > 0) {
        return next(new Errorhandler(`Can't submit!! These FgId ${alreadyScanFgId.join("")} are already scanned.`, 409));
    }

    // checking if fg id not scan during oven-in
    const allFgIdFromMgDbCollection = isEnteredFgIdExist.flatMap(currData => currData.ovenInSemiFGIds.map(currItem => currItem.smFgId))
    const notFoundFgId = enteredData.fgId.filter(currItem => !allFgIdFromMgDbCollection.includes(currItem))
    const indexOfNotFoundFgId = notFoundFgId.map(currData => {
        if (enteredData.fgId.indexOf(currData) > -1) {
            return `${enteredData.fgId.indexOf(currData) + 1}. ${enteredData.fgId[enteredData.fgId.indexOf(currData)]}, `
        }
    })

    if (indexOfNotFoundFgId.length > 0) {
        return next(new Errorhandler(`Can't submit!! These FgId ${indexOfNotFoundFgId.join("")} does not scan during oven in.`, 404));
    }

    console.log(`MiddleWare Pass Successfully`);
    
    next()

})

const definedQualityOfFg = catchAsyncError(async (req, res, next) => {
    const filledData = req.body;
    const enteredData = {
        outTime: new Date(),
        outBy: req.user.name,
        quality: filledData.quality,
        fgId: filledData.fgId
    }

    const updatedData = await ovenDataModel.updateMany(
        { "ovenInSemiFGIds.smFgId": { $in: enteredData.fgId }, "ovenInSemiFGIds.quality": "N/D" },
        {
            $set: {
                "ovenInSemiFGIds.$[elem].quality": enteredData.quality,
                "ovenInSemiFGIds.$[elem].outTime": enteredData.outTime,
                "ovenInSemiFGIds.$[elem].outBy": enteredData.outBy
            }
        },
        {
            arrayFilters: [{ "elem.smFgId": { $in: enteredData.fgId }, "elem.quality": "N/D" }]
        }
    );

    if (updatedData.modifiedCount == 0) {
        return next(new Errorhandler(`Something went wrong fg id are not submitted`, 304))
    }


    res.status(200).json({
        success: true,
        message: `Submitted Successfully`,
        updatedData

    })
})


const getAllDataOfOvenOut = catchAsyncError(async (req, res, next) => {
 
        const resultPerPage = 50;
        const page = Number(req.query.page) || 1;
        const skip = resultPerPage * (page - 1);

        const matchStage = { ...req.query };

        const removeFields = ["page", "limit", "startDate", 'endDate', 'onDate','sort'];
        removeFields.forEach((key) => delete matchStage[key]);

        if ('onDate' in req.query) {
            matchStage["outTime"] = {
                $gte: new Date(req.query.onDate),
                $lte: new Date(new Date(req.query.onDate).setUTCHours(23, 59, 59, 999))
            }
        }


        if ('startDate' in  req.query && 'endDate' in  req.query) {
            matchStage["outTime"] = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(new Date(req.query.endDate).setUTCHours(23, 59, 59, 999))
            }
        }

        const ovenOutData = await ovenDataModel.aggregate([
            {
                $project: {
                    _id: 1,
                    batchIdOfOvenIn: 1,
                    ovenSerialNo: 1,
                    temp: 1,
                    batchInTime: 1,
                    batchOutTime: 1,
                    ovenInSemiFGIds: {
                        $filter: {
                            input: "$ovenInSemiFGIds",
                            as: "item",
                            cond: { $ne: ["$$item.quality", "N/D"] }
                        }
                    }
                }
            },
            { $unwind: "$ovenInSemiFGIds" },
            {
                $project: {
                    _id: 1,
                    batchIdOfOvenIn: 1,
                    ovenSerialNo: 1,
                    temp: 1,
                    batchInTime: 1,
                    batchOutTime: 1,
                    smFgId: "$ovenInSemiFGIds.smFgId",
                    quality: "$ovenInSemiFGIds.quality",
                    inTime: "$ovenInSemiFGIds.inTime",
                    outTime: "$ovenInSemiFGIds.outTime",
                    inBy: "$ovenInSemiFGIds.inBy",
                    outBy: "$ovenInSemiFGIds.outBy"
                }
            },
            { $match: matchStage }, 
            { $sort: { outTime: -1 } },
            { $skip: skip },
            { $limit: resultPerPage }
        ]);
        const allFilteredData = await ovenDataModel.aggregate([
            {
                $project: {
                    _id: 1,
                    batchIdOfOvenIn: 1,
                    ovenSerialNo: 1,
                    temp: 1,
                    batchInTime: 1,
                    batchOutTime: 1,
                    ovenInSemiFGIds: {
                        $filter: {
                            input: "$ovenInSemiFGIds",
                            as: "item",
                            cond: { $ne: ["$$item.quality", "N/D"] }
                        }
                    }
                }
            },
            { $unwind: "$ovenInSemiFGIds" },
            {
                $project: {
                    _id: 1,
                    batchIdOfOvenIn: 1,
                    ovenSerialNo: 1,
                    temp: 1,
                    batchInTime: 1,
                    batchOutTime: 1,
                    smFgId: "$ovenInSemiFGIds.smFgId",
                    quality: "$ovenInSemiFGIds.quality",
                    inTime: "$ovenInSemiFGIds.inTime",
                    outTime: "$ovenInSemiFGIds.outTime",
                    inBy: "$ovenInSemiFGIds.inBy",
                    outBy: "$ovenInSemiFGIds.outBy"
                }
            },
            { $match: matchStage }, 
            { $sort: { outTime: -1 } },
        ]);

        res.status(200).json({
            success: true,
            message: `Data of oven out retrieved successfully.`,
            totalNoOfDataFiltered: allFilteredData.length, 
            totalDataShowedOnOnePage: ovenOutData.length,
            resultPerPage,
            ovenOutData,
            allFilteredData

        });
  
});





module.exports = {
    middlewareForOvenOutFg,
    definedQualityOfFg,
    getAllDataOfOvenOut,
};


