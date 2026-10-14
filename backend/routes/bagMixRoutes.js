const express = require("express");
const {
    createBagMix,
    getActiveBagMixes,
    getAllBagMixes,
    getBagMixDetails,
    updateBagMixStatus,
    getMouldTraceability
} = require("../controller/bagMix");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/bag-mix/create").post(isAuthenticatedUser, createBagMix);
router.route("/bag-mix/active").get(isAuthenticatedUser, getActiveBagMixes);
router.route("/bag-mix/all").get(isAuthenticatedUser, getAllBagMixes);
router.route("/bag-mix/:mixId").get(isAuthenticatedUser, getBagMixDetails);
router.route("/bag-mix/:mixId/status").put(isAuthenticatedUser, updateBagMixStatus);
router.route("/mould-traceability/:mouldId").get(isAuthenticatedUser, getMouldTraceability);

module.exports = router;
