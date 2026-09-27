const express = require("express")
const { rejectNewMould, getRejectedMoldData, deleteRejectedMouldData, updateRejectedMouldFillingData } = require("../controller/mouldIncubation")
const validate = require("../middleware/validateMiddlewares")
const bagIncubationZodSchema = require("../validators/mouldIncubationValidators")
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router()

router.route("/rejectNewMould").post(isAuthenticatedUser, validate(bagIncubationZodSchema),rejectNewMould)
router.route("/getRejectedMoldData").get(isAuthenticatedUser, getRejectedMoldData)
router.route("/admin/deleteRejectedMouldData/:id").delete(isAuthenticatedUser, deleteRejectedMouldData)
router.route("/admin/updateRejectedMouldFillingData/:id").put(isAuthenticatedUser,validate(bagIncubationZodSchema),updateRejectedMouldFillingData)

module.exports = router