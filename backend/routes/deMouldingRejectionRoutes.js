const express = require("express");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { rejectNewDeMould, getRejectedDeMoldData, deleteRejectedDeMouldData } = require("../controller/deMouldingRejection");
const router = express.Router();
router.route("/rejectNewDeMould").post(isAuthenticatedUser, rejectNewDeMould)
router.route("/getRejectedDeMoldData").get(isAuthenticatedUser, getRejectedDeMoldData)
router.route("/admin/deleteRejectedDeMouldData/:id").delete(isAuthenticatedUser, deleteRejectedDeMouldData)
module.exports = router