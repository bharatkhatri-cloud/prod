const catchAsyncError = require("../middleware/catchAsyncError");
const Errorhandler = require("../utils/Errorhandler");
const ApiFeatures = require("../utils/Apifeatures");
const DeMouldingPieceModel = require("../models/deMouldingNewPieceModel");
const MouldFillingModel = require("../models/mouldFillingModel");

const deMouldNewPiece = catchAsyncError(async (req, res, next) => {
    const enteredDataOfNewDeMouldPiece = req.body;
    const pieceDeMouldedBy = req.user.name;

    const isPieceAlreadyAdded = await DeMouldingPieceModel.findOne({ smFgId: enteredDataOfNewDeMouldPiece.smFgId });

    if (enteredDataOfNewDeMouldPiece.smFgId.startsWith('DM') && enteredDataOfNewDeMouldPiece.smFgId.length >= 8) {
        if (isPieceAlreadyAdded) {
            return next(new Errorhandler(`Can not add!!, Piece Id (${isPieceAlreadyAdded.smFgId}) already added`, 404));
        }
    
        const isMouldIdAlreadyDeMoulded = await DeMouldingPieceModel.findOne({ mouldId: enteredDataOfNewDeMouldPiece.mouldId });
        if (isMouldIdAlreadyDeMoulded) {
            return next(new Errorhandler(`Can not add!!, Mould Id (${isMouldIdAlreadyDeMoulded.mouldId}) already De-Moulded`, 404));
        }
    
    
    
    
    
        const findingMouldFillingStatus = await MouldFillingModel.findOne({ mouldId: enteredDataOfNewDeMouldPiece.mouldId });
        if (!findingMouldFillingStatus) {
            const deMouldedPieceData = await DeMouldingPieceModel.create({ ...enteredDataOfNewDeMouldPiece, pieceDeMouldedBy:pieceDeMouldedBy, previousStatusTillMouldFilling: "6763ad37e5fe0842bcaa7e31"});
            res.status(201).json({
                success:true,
                message: `Piece De-Moulded  successfully`,
                deMouldedPieceData
            })
            // return next(new Errorhandler(`Can not add!!, Mould Id (${enteredDataOfNewDeMouldPiece.mouldId}) not found in Mould  Filling department`, 400))
        } else {
    
            const deMouldedPieceData = await DeMouldingPieceModel.create({ ...enteredDataOfNewDeMouldPiece, pieceDeMouldedBy: pieceDeMouldedBy, previousStatusTillMouldFilling: findingMouldFillingStatus._id });
            res.status(201).json({
                success: true,
                message: `Piece De-Moulded  successfully`,
                deMouldedPieceData
            })
        }
    }else if (enteredDataOfNewDeMouldPiece.smFgId.length >= 8) {
        // alertMessage(`Can't add! ID must start with "DM".`);
        return next(new Errorhandler(`Can't add! ID must start with "DM".`,400))
    } else if (enteredDataOfNewDeMouldPiece.smFgId.length < 8) {
        return next(new Errorhandler(`Can't add! ID must at least of 8 character.`,400))
        // alertMessage(`Can't add! ID must at least of 8 character.`);
    }

    

})



const getDeMouldPieceData = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 50;

    const totalDeMouldedPieceData = await DeMouldingPieceModel.countDocuments();

    const apiFeatures = new ApiFeatures(DeMouldingPieceModel.find(), req.query).filter("deMouldingPieceTime").pagination(resultPerPage).sort("deMouldingPieceTime");
    const deMouldingPieceData = await apiFeatures.query.populate("previousStatusTillMouldFilling");

    const apiFeaturesForAllFilteredData = new ApiFeatures(DeMouldingPieceModel.find(), req.query).filter("deMouldingPieceTime").sort("deMouldingPieceTime")
    const allFilteredData = await apiFeaturesForAllFilteredData.query.populate("previousStatusTillMouldFilling");
    const totalNoOfDataFiltered = allFilteredData.length;


    if (deMouldingPieceData.length == 0 ) {
        return next(new Errorhandler("For Selected Query, Data Is Not Present", 404));
    }


    res.status(200).json({
        success: true,
        message: `Data Fetch`,
        totalDeMouldedPieceData,
        totalNoOfDataFiltered: totalNoOfDataFiltered,
        totalDataShowedOnOnePage: deMouldingPieceData.length,
        resultPerPage,
        deMouldingPieceData,
        allFilteredData

    });
});


const deleteDeMouldingPieceData = catchAsyncError(async (req, res, next) => {
    let deMouldingPieceData = await DeMouldingPieceModel.findById(req.params.id)



    if (!deMouldingPieceData) {
        return next(new Errorhandler("For this MongoDB Id Data Of De-Moulded Piece is not found", 404));
    }

    const deletedRejectedBagData = await deMouldingPieceData.deleteOne()

    res.status(201).json({
        success: true,
        message: `Piece Id ${deMouldingPieceData.smFgId} has been deleted successfully.`,
        deletedRejectedBagData
    })
})


const updateDeMouldedPieceData = catchAsyncError(async (req, res, next) => {
    const deMouldedPieceData = await DeMouldingPieceModel.findById(req.params.id)
    if (!deMouldedPieceData) {
        return next(new Errorhandler("For this MongoDB Id data is not found", 404));
    }

    const enteredData = req.body

    //!checking that id should not be taken by other data 
    const isPieceIdAlreadyTakenByOther = await DeMouldingPieceModel.findOne({ smFgId: enteredData.smFgId });
    if (isPieceIdAlreadyTakenByOther && isPieceIdAlreadyTakenByOther._id.toString() !== req.params.id) {
        return next(new Errorhandler(`Piece Id (${isPieceIdAlreadyTakenByOther.smFgId}) is already taken by other Mould Id (${isPieceIdAlreadyTakenByOther.mouldId})`, 400));
    }



    const shouldExistInPrevDb = await MouldFillingModel.findOne({ mouldId: enteredData.mouldId })


    if (!shouldExistInPrevDb) {

        // const updatedData = await DeMouldingPieceModel.findByIdAndUpdate(req.params.id,{...enteredData, pieceDeMouldedBy:pieceDeMouldedBy, previousStatusTillMouldFilling: "6763ad37e5fe0842bcaa7e31",deMouldingPieceTime:Date.now() } , { new: true })

        // res.status(201).json({
        //     success:true,
        //     message: `De-Moulded Piece data has been updated with Mould Id "${updatedData.mouldId}" and Piece Id  "${updatedData.smFgId}".`,
        //     updatedData
        // })
        return next(new Errorhandler(`Can't Update!! Entered mould id (${enteredData.mouldId}) is not present in the mould filling department`, 404));

    } else {

        const updatedData = await DeMouldingPieceModel.findByIdAndUpdate(
            req.params.id,
            {
                ...enteredData,
                previousStatusTillMouldFilling: shouldExistInPrevDb._id,
                $set: { updatedAt: new Date() }
            }

            , {
                new: true,
                strict: false

            }
        )

        res.status(200).json({
            success: true,
            message: `De-Moulded Piece data has been updated with Mould Id "${updatedData.mouldId}" and Piece Id  "${updatedData.smFgId}".`,
            updatedData
        })
    }

})


module.exports = { deMouldNewPiece, getDeMouldPieceData, deleteDeMouldingPieceData, updateDeMouldedPieceData }
