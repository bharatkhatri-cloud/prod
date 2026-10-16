const express = require("express")
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/authMiddleware");
const { validationForMouldRejection, rejectNewMould, rejectMouldsByMixId, getRejectedMouldData, deleteRejectedMould, updateRjectedMould } = require("../controller/mouldRejection");
const router = express.Router()


router.route("/rejectMould").put(isAuthenticatedUser ,validationForMouldRejection,rejectNewMould)
router.route("/rejectMouldsByMix/:mixId").post(isAuthenticatedUser, rejectMouldsByMixId);
router.route("/getRejectedMouldData").get(isAuthenticatedUser, getRejectedMouldData)
router.route("/admin/rejectMouldsByMix/:mixId").post(isAuthenticatedUser, authorizeRoles("Admin"), rejectMouldsByMixId);
router.route("/admin/deleteRejectedMould/:id").delete(isAuthenticatedUser, authorizeRoles("Admin") ,deleteRejectedMould)
router.route("/admin/updateRjectedMould/:id").put(isAuthenticatedUser,authorizeRoles("Admin"), updateRjectedMould)


module.exports = router