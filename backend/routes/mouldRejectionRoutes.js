const express = require("express")
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/authMiddleware");
const { validationForMouldRejection, rejectNewMould, getRejectedMouldData, deleteRejectedMould, updateRjectedMould } = require("../controller/mouldRejection");
const router = express.Router()


router.route("/rejectMould").put(isAuthenticatedUser ,validationForMouldRejection,rejectNewMould)
router.route("/getRejectedMouldData").get(isAuthenticatedUser, getRejectedMouldData)
router.route("/admin/deleteRejectedMould/:id").delete(isAuthenticatedUser, authorizeRoles("Admin") ,deleteRejectedMould)
router.route("/admin/updateRjectedMould/:id").put(isAuthenticatedUser,authorizeRoles("Admin"), updateRjectedMould)


module.exports = router