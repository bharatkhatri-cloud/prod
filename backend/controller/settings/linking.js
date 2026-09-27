const catchAsyncError = require("../../middleware/catchAsyncError");
const Errorhandler = require("../../utils/Errorhandler");
const LcPreparationModel = require("../../models/lcPreparationModel");
const JamPreparationModel = require("../../models/jamPreparationModel");
const BagInoculationModel = require("../../models/bagInoculationModel");
const LinkingModel = require("../../models/setting/linkingModel");


const bagInoculationLinking = catchAsyncError(async (req, res, next) => {
    const enteredData = req.body;

    //Making false/true for LC/Jam Linking
    const linkingStatus = {
        backLinking: false,
        reUseLcOrJam: false
    };

    //Finding LC/Jam data
    let lcPreparation = await LcPreparationModel.findOne({ lcId: enteredData.JamOrLcId });
    const jamPreparation = await JamPreparationModel.findOne({ jamId: enteredData.JamOrLcId });


    // agar lc ya jam me se koi nahi hai to andar jao.
    if (!lcPreparation && !jamPreparation) {
        if (linkingStatus.backLinking) {
            //agar backlinking hai to not allow to add new bag without jam and lc info
            return next(new Errorhandler(`Cannot add the bag. The entered LC/Jam ID "${enteredData.JamOrLcId}" does not exist in our previous records`, 403));
        } else {
            //agar backlinking nahi hai to LC NA wala dal dena hai
            lcPreparation = await LcPreparationModel.findOne({ lcId: 'LC NA' });
        }
    }

    // i am allowing or not to reuse the lc or jam multiple times
    
    if (!linkingStatus.reUseLcOrJam) {
        // Check if the LC or Jam ID is already use in bag inoculation
        const isLcOrJamAlreadyUse = await BagInoculationModel.findOne({ JamOrLcId: enteredData.JamOrLcId });
        if (isLcOrJamAlreadyUse) {
            return next(new Errorhandler(`Can't add the LC/Jam!! LC/Jam ID "${isLcOrJamAlreadyUse.JamOrLcId}" is already used`, 403));
        }
    }


    // LC ya fir Jam me se dono me koi bhi hai to uski id dal to. 
    let previousStatusData = {};
    if (lcPreparation) {
        previousStatusData = {
            previousStatusTillJamOrLCPreparation: lcPreparation._id,
            previousStatusModel: 'Lcpreparation'
        };
    } else if (jamPreparation) {
        previousStatusData = {
            previousStatusTillJamOrLCPreparation: jamPreparation._id,
            previousStatusModel: 'Jampreparation'
        };
    }

    // Attach to req for later use
    req.bagInoculationLinking = { prevStatus: previousStatusData };

    next();
});


const newSettingInfo = catchAsyncError(async (req, res, next) => {
    // const settingInfo = {
    //     stageName: 'Bag Inoculation',
    //     idPrefix: 'SB',
    //     idLength: 7,
    //     backLinking: true
    // };
    const settingInfo = req.body;

    const insertedRecord = await LinkingModel.create(settingInfo);
    res.status(201).json({
        success: true,
        message: `New Setting Info Inserted succesfully`,
        insertedRecord
    })

});

module.exports = { bagInoculationLinking, newSettingInfo }