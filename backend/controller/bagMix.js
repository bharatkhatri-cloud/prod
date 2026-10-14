const catchAsyncError = require("../middleware/catchAsyncError");
const BagMixModel = require("../models/bagMixModel");
const BagIncubationModel = require("../models/bagIncubationModel");
const BagInoculationModel = require("../models/bagInoculationModel");
const MouldFillingModel = require("../models/mouldFillingModel");
const LcPreparationModel = require("../models/lcPreparationModel");
const JamPreparationModel = require("../models/jamPreparationModel");
const Errorhandler = require("../utils/Errorhandler");
const { expandSequentialRange } = require("../utils/rangeHelper");

/**
 * Creates a new Bag Mix batch (from breaking machine)
 * Accepts either:
 * - { bagIds: ["SB001", "SB002", ...] }
 * - OR { startBagId: "SB00100", endBagId: "SB00114" }
 */
const createBagMix = catchAsyncError(async (req, res, next) => {
    const { bagIds: rawBagIds, startBagId, endBagId, notes, customMixId } = req.body;
    const mixedBy = req.user ? req.user.name : "Supervisor";

    let bagIds = [];

    // Range-based resolution
    if (startBagId && endBagId) {
        try {
            const expanded = expandSequentialRange(startBagId, endBagId);
            bagIds = [...bagIds, ...expanded];
        } catch (err) {
            return next(new Errorhandler(err.message, 400));
        }
    }

    // Direct list resolution
    if (Array.isArray(rawBagIds) && rawBagIds.length > 0) {
        bagIds = [...bagIds, ...rawBagIds.map(b => (typeof b === 'object' ? b.bagId : b).trim())];
    }

    // Deduplicate and filter empty
    const uniqueBagIds = Array.from(new Set(bagIds.filter(Boolean)));

    if (uniqueBagIds.length === 0) {
        return next(new Errorhandler("Please provide at least one Bag ID (scan or range).", 400));
    }

    // Validation: Check if any bag was rejected in Incubation
    const rejectedBags = await BagIncubationModel.find({ bagId: { $in: uniqueBagIds } });
    if (rejectedBags.length > 0) {
        const rejectedIds = rejectedBags.map(b => b.bagId).join(", ");
        return next(new Errorhandler(`Cannot mix rejected bags: ${rejectedIds}`, 400));
    }

    // Generate unique Mix ID if not provided
    let mixId = customMixId ? customMixId.trim() : null;
    if (!mixId) {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        mixId = `MX-${todayStr}-${randomSuffix}`;
    }

    // Ensure uniqueness
    const existing = await BagMixModel.findOne({ mixId });
    if (existing) {
        return next(new Errorhandler(`Mix ID "${mixId}" already exists.`, 409));
    }

    const bagMix = await BagMixModel.create({
        mixId,
        bagIds: uniqueBagIds,
        bagCount: uniqueBagIds.length,
        mixedBy,
        mixDate: new Date(),
        status: "ACTIVE",
        totalMouldsFilled: 0,
        notes: notes || ""
    });

    res.status(201).json({
        success: true,
        message: `Bag mix "${mixId}" created successfully with ${uniqueBagIds.length} bags.`,
        bagMix
    });
});

/**
 * Get active mixes available for mould filling
 */
const getActiveBagMixes = catchAsyncError(async (req, res, next) => {
    const activeMixes = await BagMixModel.find({ status: "ACTIVE" })
        .sort({ mixDate: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        count: activeMixes.length,
        activeMixes
    });
});

/**
 * Get all mixes with pagination / filtering
 */
const getAllBagMixes = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.search) {
        query.$or = [
            { mixId: { $regex: req.query.search, $options: "i" } },
            { bagIds: { $regex: req.query.search, $options: "i" } },
            { mixedBy: { $regex: req.query.search, $options: "i" } }
        ];
    }

    const totalCount = await BagMixModel.countDocuments(query);
    const mixes = await BagMixModel.find(query)
        .sort({ mixDate: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        mixes
    });
});

/**
 * Get details of a single mix including filled moulds
 */
const getBagMixDetails = catchAsyncError(async (req, res, next) => {
    const { mixId } = req.params;
    const bagMix = await BagMixModel.findOne({ mixId });

    if (!bagMix) {
        return next(new Errorhandler(`Mix with ID "${mixId}" not found.`, 404));
    }

    const moulds = await MouldFillingModel.find({ mixId }).sort({ fillingDate: -1 });

    res.status(200).json({
        success: true,
        bagMix,
        filledMouldsCount: moulds.length,
        moulds
    });
});

/**
 * Update mix status (e.g. mark EXHAUSTED)
 */
const updateBagMixStatus = catchAsyncError(async (req, res, next) => {
    const { mixId } = req.params;
    const { status, notes } = req.body;

    const bagMix = await BagMixModel.findOne({ mixId });
    if (!bagMix) {
        return next(new Errorhandler(`Mix with ID "${mixId}" not found.`, 404));
    }

    if (status) bagMix.status = status;
    if (notes !== undefined) bagMix.notes = notes;
    await bagMix.save();

    res.status(200).json({
        success: true,
        message: `Mix "${mixId}" status updated to ${bagMix.status}.`,
        bagMix
    });
});

/**
 * End-to-end traceability for any mould ID
 */
const getMouldTraceability = catchAsyncError(async (req, res, next) => {
    const { mouldId } = req.params;
    const mould = await MouldFillingModel.findOne({ mouldId: mouldId.trim() });

    if (!mould) {
        return next(new Errorhandler(`Mould ID "${mouldId}" not found.`, 404));
    }

    let mix = null;
    let componentBagIds = [];

    if (mould.mixId) {
        mix = await BagMixModel.findOne({ mixId: mould.mixId });
        if (mix) {
            componentBagIds = mix.bagIds || [];
        }
    } else if (mould.bagIds && mould.bagIds.length > 0) {
        componentBagIds = mould.bagIds;
    } else if (mould.bagId) {
        componentBagIds = [mould.bagId];
    }

    // Lookup bag details and parent LC / Jam details
    const bagDetails = await BagInoculationModel.find({ bagId: { $in: componentBagIds } });
    
    const parentInoculumIds = bagDetails.map(b => b.JamOrLcId).filter(Boolean);
    const lcs = await LcPreparationModel.find({ lcId: { $in: parentInoculumIds } });
    const jams = await JamPreparationModel.find({ jamId: { $in: parentInoculumIds } });

    res.status(200).json({
        success: true,
        mould,
        mix,
        componentBagCount: componentBagIds.length,
        componentBags: bagDetails,
        parentLiquidCultures: lcs,
        parentJams: jams
    });
});

module.exports = {
    createBagMix,
    getActiveBagMixes,
    getAllBagMixes,
    getBagMixDetails,
    updateBagMixStatus,
    getMouldTraceability
};
