const JamPreparationModel = require("../models/jamPreparationModel");
const LcPreparationModel = require("../models/lcPreparationModel");
const LcRejectionModel = require("../models/lcRejectionModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const BagIncubationModel = require("../models/bagIncubationModel");
const MouldFillingModel = require("../models/mouldFillingModel");
const MouldIncubationModel = require("../models/mouldIncubationModel");
const DeMouldingPieceModel = require("../models/deMouldingNewPieceModel");
const DeMouldingRejectionModel = require("../models/deMouldingRejectionModel");
const OvenDataModel = require("../models/ovenDataModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/Apifeatures");
const ovenDataModel = require("../models/ovenDataModel");
const HumidifierDataModel = require("../models/humidiferDataModel");

exports.getDataOfAllModules = catchAsyncError(async (req, res) => {
  const resultPerPage = Number.MAX_SAFE_INTEGER;


  // console.log("req.quer : ", req.query)
  const apiFeaturesForJamPreparation = new ApiFeatures(JamPreparationModel.find(), req.query).filter("jamPreparationTime").sort("jamPreparationTime").pagination(resultPerPage);
  const dataOfAllPreparedJam = await apiFeaturesForJamPreparation.query;


  const apiFeaturesForLcPreparation = new ApiFeatures(LcPreparationModel.find(), req.query).filter("lcPreparationTime").sort("lcPreparationTime").pagination(resultPerPage);
  const dataOfAllPreparedLc = await apiFeaturesForLcPreparation.query;

  const apiFeaturesForLcRejection = new ApiFeatures(LcRejectionModel.find(), req.query).filter("lcRejectionTime").sort("lcRejectionTime").pagination(resultPerPage);
  const dataOfAllRejectedLc = await apiFeaturesForLcRejection.query;


  const apiFeaturesForBagInoculation = new ApiFeatures(BagInoculationModel.find(), req.query).filter("inoculationTimeStamp").sort("inoculationTimeStamp").pagination(resultPerPage);
  const dataOfAllBagInoculationData = await apiFeaturesForBagInoculation.query;

  const apiFeaturesForBagIncubation = new ApiFeatures(BagIncubationModel.find(), req.query).filter("bagRejectionTime").sort("bagRejectionTime").pagination(resultPerPage);
  const dataOfAllRejectedBag = await apiFeaturesForBagIncubation.query;


  //TOdo : mould related count
  const apiFeaturesForMouldFilling = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate").sort("fillingDate").pagination(resultPerPage);
  const dataOfAllMouldFillingData = await apiFeaturesForMouldFilling.query;
  const bagScannedInMouldFillingCount = await new FindCount(req.query).bagScannedInMouldFilling();
  const mouldRejectionCount = await new FindCount(req.query).getRejectedMouldCount();


  const apiFeaturesForMouldIncubation = new ApiFeatures(MouldIncubationModel.find(), req.query).filter("rejectionTime").sort("rejectionTime").pagination(resultPerPage);
  const dataOfAllMouldRejectedData = await apiFeaturesForMouldIncubation.query;


  const apiFeaturesForDeMouldingPiece = new ApiFeatures(DeMouldingPieceModel.find(), req.query).filter("deMouldingPieceTime").sort("deMouldingPieceTime").pagination(resultPerPage);
  const dataOfAllDeMouldedPiece = await apiFeaturesForDeMouldingPiece.query;

  const apiFeaturesForDeMouldingRejection = new ApiFeatures(DeMouldingRejectionModel.find(), req.query).filter("rejectedDeMouldingTime").sort("rejectedDeMouldingTime").pagination(resultPerPage);
  const dataOfAllDeMouldedRejection = await apiFeaturesForDeMouldingRejection.query;





  //! for oven in & out and also batch count
  const ovenInBatchCount = await new FindCount(req.query).batchOvenIn();
  const ovenInCount = await new FindCount(req.query).getSmFgIdCountByInTime();
  const ovenOutCount = await new FindCount(req.query).getSmFgIdCountByOutTime();


  //! for humidifier item count and batch count
  const humidifierCount = await new FindCount(req.query).humidifierItemCout();
  const humidifierBatchCount = await new FindCount(req.query).getHumidifierBatchCount();


  //! do same thing for oven in and remove batch automatice when the all item scan in oven out
  res.status(200).json({
    message: `Data Of All Modules`,
    allModuleData: {
      // ? Jam
      totalCountDataOfPreparedJam: dataOfAllPreparedJam.length,
      
      // ? LC
      totalCountDataOfPreparedLc: dataOfAllPreparedLc.length,
      totalCountDataOfRejectedLc: dataOfAllRejectedLc.length,
      
      // ? Bag 
      totalCountDataOfBagInoculationData: dataOfAllBagInoculationData.length,
      totalCountDataOfRejectedBag: dataOfAllRejectedBag.length,
      
      // ? Mould
      totalCountDataOfMouldFillingData: dataOfAllMouldFillingData.length,
      bagScannedInMouldFillingCount,
      mouldRejectionCount,
      
      // ? De-Mould
      totalCountDataOfDeMouldedPiece: dataOfAllDeMouldedPiece.length,
      
      // ? Humidifier
      humidifierBatchCount,
      humidifierCount,
      
      // ? Oven
      ovenInBatchCount,
      ovenInCount,
      ovenOutCount,
    }
  });

})





class FindCount {
  constructor(queryStr) {
    this.queryStr = queryStr;
  }

  // Utility function to get start and end of the day
    getDateRange() {
      let startOfDay, endOfDay;

      if ("onDate" in this.queryStr) {
        startOfDay = new Date(new Date(this.queryStr.onDate).setHours(0, 0, 0, 0))
        // startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(new Date(this.queryStr.onDate).setHours(23, 59, 59, 999))
        // endOfDay.setHours(23, 59, 59, 999);

      } else if ("startDate" in this.queryStr && "endDate" in this.queryStr) {
        startOfDay = new Date(new Date(this.queryStr.startDate).setHours(0, 0, 0, 0))
        // startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(new Date(this.queryStr.endDate).setHours(23, 59, 59, 999))
        // endOfDay.setHours(23, 59, 59, 999);
      } else {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        startOfDay = new Date(new Date(formattedDate).setHours(0, 0, 0, 0))
        // startOfDay;
        endOfDay = new Date(new Date(formattedDate).setHours(23, 59, 59, 999))
        // endOfDay;
      }

    
      // console.count()
      // console.log("startOfDay", startOfDay);
      // console.log("endOfDay", endOfDay);
      // console.count()
      
      return { startOfDay, endOfDay };
    }

  //Todo: scanned bag in the mould filling 
  async bagScannedInMouldFilling() {
    const { startOfDay, endOfDay } = this.getDateRange();

    //! locha of time zone
    // console.log("startOfDay", startOfDay);
    // console.log("endOfDay", endOfDay);


    try {
      const result = await MouldFillingModel.aggregate([
        { $match: { fillingDate: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: "$bagId" } }, // Group by unique bagId
        { $count: "uniqueBagCount" }, // Count unique bagIds
      ]);


      // setUTCHours
      // setUTCHours
      return result.length > 0 ? result[0].uniqueBagCount : 0;
    } catch (error) {
      console.error("Error fetching unique bag count by fillingDate:", error);
      return 0;
    }
  }


  //! mould rejection
  async getRejectedMouldCount() {
    const { startOfDay, endOfDay } = this.getDateRange();

    try {
      const result = await MouldFillingModel.aggregate([
        {
          $match: {
            isMouldRejected: true,
            mouldRejectionReason: { $ne: "" }, // Ensure it has a value
            mouldRejectionDate: { $gte: startOfDay, $lte: endOfDay }, // Filter by date
            mouldRejectedBy: { $ne: "" }, // Ensure it has a value
          },
        },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$mouldRejectionDate" } } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      return result.reduce((acc, curr) => acc + curr.count, 0);
    } catch (error) {
      console.error("Error fetching rejected mould count by date:", error);
      return 0;
    }
  }

  //! count for batch oven in

  async batchOvenIn() {
    const { startOfDay, endOfDay } = this.getDateRange();

    try {
      const result = await ovenDataModel.aggregate([
        { $match: { batchInTime: { $gte: startOfDay, $lte: endOfDay } } },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$batchInTime" } } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      return result.reduce((acc, curr) => acc + curr.count, 0);
    } catch (error) {
      console.error("Error fetching count by batchInTime:", error);
      return 0;
    }
  }



  async getSmFgIdCountByTime(timeField) {


    const { startOfDay, endOfDay } = this.getDateRange();

    try {
      const result = await ovenDataModel.aggregate([
        { $unwind: "$ovenInSemiFGIds" },
        { $match: { [`ovenInSemiFGIds.${timeField}`]: { $gte: startOfDay, $lte: endOfDay } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: `$ovenInSemiFGIds.${timeField}` } },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      return result.reduce((acc, curr) => acc + curr.count, 0);
    } catch (error) {
      console.error(`Error fetching oven count by ${timeField}:`, error);
      return 0;
    }
  }

  async getSmFgIdCountByInTime() {
    return this.getSmFgIdCountByTime("inTime");
  }

  async getSmFgIdCountByOutTime() {
    return this.getSmFgIdCountByTime("outTime");
  }




  async humidifierItemCout() {

    const { startOfDay, endOfDay } = this.getDateRange();

    try {
      const result = await HumidifierDataModel.aggregate([
        { $unwind: "$smFgData" }, // Flatten the smFgData array
        { $match: { placingTime: { $gte: startOfDay, $lte: endOfDay } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$placingTime" } },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      return result.reduce((acc, curr) => acc + curr.count, 0);
    } catch (error) {
      console.error("Error fetching count by placingTime:", error);
      return 0;
    }
  }


  async getHumidifierBatchCount() {
    const { startOfDay, endOfDay } = this.getDateRange();

    try {
      const result = await HumidifierDataModel.aggregate([
        { $match: { placingTime: { $gte: startOfDay, $lte: endOfDay } } },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$placingTime" } } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      return result.reduce((acc, curr) => acc + curr.count, 0);
    } catch (error) {
      console.error("Error fetching count by placingTime:", error);
      return 0;
    }
  }


}










exports.getDataOfLcModules = catchAsyncError(async (req, res) => {


  const totalLcPreparationData = await LcPreparationModel.countDocuments()
  const apiFeaturesForLcPreparation = new ApiFeatures(LcPreparationModel.find(), req.query).filter("lcPreparationTime");
  const dataOfAllPreparedLc = await apiFeaturesForLcPreparation.query;

  const totalLcRejectedData = await LcRejectionModel.countDocuments()
  const apiFeaturesForLcRejection = new ApiFeatures(LcRejectionModel.find(), req.query).filter("lcRejectionTime");
  const dataOfAllRejectedLc = await apiFeaturesForLcRejection.query;

  const rejectionReasonCounts = dataOfAllRejectedLc.reduce((accumulator, nextItem) => {
    // console.log("accumulator",accumulator); //! initially accumulator was ==> 1.{} ==>  2.{ Other: 1 } ==> 3.{ Other: 1, 'Media leak from bottle': 1 } ==>......
    //console.log("nextItem",nextItem);
    if (nextItem.reasonOfRejection.toLowerCase().includes("other")) {
      // console.log("nextItem reasonOfRejection:", nextItem);
      // console.log("nextItem reasonOfRejection:", nextItem.reasonOfRejection);
      accumulator["Other"] = (accumulator["Other"] || 0) + 1;
    } else {
      accumulator[nextItem.reasonOfRejection] = (accumulator[nextItem.reasonOfRejection] || 0) + 1;
    }
    return accumulator;
  }, {});

  const rejectionReasons = Object.keys(rejectionReasonCounts);
  const rejectionCounts = Object.values(rejectionReasonCounts);

  res.status(200).json({
    message: `Data Of LC Modules`,
    lcModulesData: {
      totalCountDataOfPreparedLc: dataOfAllPreparedLc.length,
      totalLcPreparationData,
      totalCountDataOfRejectedLc: dataOfAllRejectedLc.length,
      totalLcRejectedData,
      rejectionReasons,
      rejectionCounts,
      rejectionReasonCounts,
    }

  });
})



exports.getDataOfBagModules = catchAsyncError(async (req, res) => {
  const totalBagInoculationData = await BagInoculationModel.countDocuments()
  const apiFeaturesForBagInoculation = new ApiFeatures(BagInoculationModel.find(), req.query).filter("inoculationTimeStamp");
  const dataOfAllBagInoculationData = await apiFeaturesForBagInoculation.query;

  const totalBagRejectedData = await BagIncubationModel.countDocuments()
  const apiFeaturesForBagIncubation = new ApiFeatures(BagIncubationModel.find(), req.query).filter("bagRejectionTime");
  const dataOfAllRejectedBag = await apiFeaturesForBagIncubation.query;

  const rejectionReasonCounts = dataOfAllRejectedBag.reduce((accumulator, nextItem) => {
    if (nextItem.reasonOfRejection.toLowerCase().includes("other")) {
      accumulator["Other"] = (accumulator["Other"] || 0) + 1;
    } else {
      accumulator[nextItem.reasonOfRejection] = (accumulator[nextItem.reasonOfRejection] || 0) + 1;
    }
    return accumulator
  }, {})
  const rejectionReasons = Object.keys(rejectionReasonCounts);
  const rejectionCounts = Object.values(rejectionReasonCounts);

  res.status(200).json({
    message: `Data Of Bag Modules`,
    bagInoculationData: {
      totalCountDataOfBagInoculationData: dataOfAllBagInoculationData.length,
      totalBagInoculationData,
      totalCountDataOfRejectedBag: dataOfAllRejectedBag.length,
      totalBagRejectedData,
      rejectionReasons,
      rejectionCounts,
      rejectionReasonCounts,
    }
  });

})



exports.getDataOfMouldModules = catchAsyncError(async (req, res) => {
  const mongoose = require("mongoose");
  
  const totalMouldFilled = await MouldFillingModel.countDocuments()
  const apiFeaturesForMouldFilling = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate");
  const dataOfAllMouldFillingData = await apiFeaturesForMouldFilling.query;

  const totalRejectedMould = await MouldIncubationModel.countDocuments()
  const apiFeaturesForMouldIncubation = new ApiFeatures(MouldIncubationModel.find(), req.query).filter("rejectionTime");
  const dataOfAllMouldRejectedData = await apiFeaturesForMouldIncubation.query;
  const rejectionReasonCounts = dataOfAllMouldRejectedData.reduce((accumulator, nextItem) => {
    if (nextItem.reasonOfRejection.toLowerCase().includes("other")) {
      accumulator["Other"] = (accumulator["Other"] || 0) + 1;
    } else {
      accumulator[nextItem.reasonOfRejection] = (accumulator[nextItem.reasonOfRejection] || 0) + 1;
    }
    return accumulator
  }, {})
  const rejectionReasons = Object.keys(rejectionReasonCounts);
  const rejectionCounts = Object.values(rejectionReasonCounts);

  // Calculate mouldBatchCount from growthbatches collection where department is 'mould-filling'
  let queryObj = { department: "mould-filling" };
  if (req.query.startDate && req.query.endDate) {
    queryObj.placingTime = {
      $gte: new Date(new Date(req.query.startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59, 999))
    };
  } else if (req.query.onDate) {
    queryObj.placingTime = {
      $gte: new Date(new Date(req.query.onDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(req.query.onDate).setHours(23, 59, 59, 999))
    };
  }

  const totalMouldBatch = await mongoose.connection.db.collection("growthbatches").countDocuments({ department: "mould-filling" });
  const mouldBatchCount = await mongoose.connection.db.collection("growthbatches").countDocuments(queryObj);

  res.status(200).json({
    message: `Data Of Mould Modules`,
    mouldModulesData: {
      totalCountDataOfMouldFillingData: dataOfAllMouldFillingData.length,
      totalMouldFilled,
      totalCountDataOfMouldRejectedData: dataOfAllMouldRejectedData.length,
      totalRejectedMould,
      mouldBatchCount,
      totalMouldBatch,
      rejectionReasons,
      rejectionCounts,
      rejectionReasonCounts,
    }
  });
})
