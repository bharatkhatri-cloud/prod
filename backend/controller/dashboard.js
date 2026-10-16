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
  const mongoose = require("mongoose");

  // Filter and count LC
  const apiFeaturesForLcPreparation = new ApiFeatures(LcPreparationModel.find(), req.query).filter("lcPreparationTime");
  const totalCountDataOfPreparedLc = await LcPreparationModel.countDocuments(apiFeaturesForLcPreparation.query.getFilter());

  const apiFeaturesForLcRejection = new ApiFeatures(LcRejectionModel.find(), req.query).filter("lcRejectionTime");
  const totalCountDataOfRejectedLc = await LcRejectionModel.countDocuments(apiFeaturesForLcRejection.query.getFilter());

  // Filter and count Bag
  const apiFeaturesForBagInoculation = new ApiFeatures(BagInoculationModel.find(), req.query).filter("inoculationTimeStamp");
  const totalCountDataOfBagInoculationData = await BagInoculationModel.countDocuments(apiFeaturesForBagInoculation.query.getFilter());

  const apiFeaturesForBagIncubation = new ApiFeatures(BagIncubationModel.find(), req.query).filter("bagRejectionTime");
  const totalCountDataOfRejectedBag = await BagIncubationModel.countDocuments(apiFeaturesForBagIncubation.query.getFilter());

  // Filter and count Mould
  const apiFeaturesForMouldFilling = new ApiFeatures(MouldFillingModel.find(), req.query).filter("fillingDate");
  const totalCountDataOfMouldFillingData = await MouldFillingModel.countDocuments(apiFeaturesForMouldFilling.query.getFilter());

  const bagScannedInMouldFillingCount = await new FindCount(req.query).bagScannedInMouldFilling().catch(() => 0);
  const mouldRejectionCount = await new FindCount(req.query).getRejectedMouldCount().catch(() => 0);

  // Mould batch count from growthbatches
  let mouldBatchQuery = { department: "mould-filling" };
  if (req.query.startDate && req.query.endDate) {
    mouldBatchQuery.placingTime = {
      $gte: new Date(new Date(req.query.startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59, 999))
    };
  } else if (req.query.onDate) {
    mouldBatchQuery.placingTime = {
      $gte: new Date(new Date(req.query.onDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(req.query.onDate).setHours(23, 59, 59, 999))
    };
  }
  const mouldBatchCount = await mongoose.connection.db.collection("growthbatches").countDocuments(mouldBatchQuery).catch(() => 0);

  // Filter and count De-Mould
  const apiFeaturesForDeMouldingPiece = new ApiFeatures(DeMouldingPieceModel.find(), req.query).filter("deMouldingPieceTime");
  const totalCountDataOfDeMouldedPiece = await DeMouldingPieceModel.countDocuments(apiFeaturesForDeMouldingPiece.query.getFilter());

  // Oven in & out and batch count
  const ovenInBatchCount = await new FindCount(req.query).batchOvenIn().catch(() => 0);
  const ovenInCount = await new FindCount(req.query).getSmFgIdCountByInTime().catch(() => 0);
  const ovenOutCount = await new FindCount(req.query).getSmFgIdCountByOutTime().catch(() => 0);

  // Humidifier item count and batch count
  const humidifierCount = await new FindCount(req.query).humidifierItemCout().catch(() => 0);
  const humidifierBatchCount = await new FindCount(req.query).getHumidifierBatchCount().catch(() => 0);

  res.status(200).json({
    message: `Data Of All Modules`,
    allModuleData: {
      // LC
      totalCountDataOfPreparedLc,
      totalCountDataOfRejectedLc,
      
      // Bag 
      totalCountDataOfBagInoculationData,
      totalCountDataOfRejectedBag,
      
      // Mould
      mouldBatchCount,
      totalCountDataOfMouldFillingData,
      bagScannedInMouldFillingCount,
      mouldRejectionCount,
      
      // De-Mould
      totalCountDataOfDeMouldedPiece,
      
      // Humidifier
      humidifierBatchCount,
      humidifierCount,
      
      // Oven
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

      if (this.queryStr.onDate && !isNaN(new Date(this.queryStr.onDate).getTime())) {
        startOfDay = new Date(new Date(this.queryStr.onDate).setHours(0, 0, 0, 0));
        endOfDay = new Date(new Date(this.queryStr.onDate).setHours(23, 59, 59, 999));
      } else if (
        this.queryStr.startDate &&
        this.queryStr.endDate &&
        !isNaN(new Date(this.queryStr.startDate).getTime()) &&
        !isNaN(new Date(this.queryStr.endDate).getTime())
      ) {
        startOfDay = new Date(new Date(this.queryStr.startDate).setHours(0, 0, 0, 0));
        endOfDay = new Date(new Date(this.queryStr.endDate).setHours(23, 59, 59, 999));
      } else {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        startOfDay = new Date(new Date(formattedDate).setHours(0, 0, 0, 0));
        endOfDay = new Date(new Date(formattedDate).setHours(23, 59, 59, 999));
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
