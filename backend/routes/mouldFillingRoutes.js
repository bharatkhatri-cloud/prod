const express = require("express");
const { filledNewMould,getMouldData, deleteMouldData, updateMouldFillingData , addNewTypeOfMould, getTypeOfMould, deleteTypeOfMould, mouldDataValidation, getNoOfBagUsedInMouldFilling } = require("../controller/mouldFilling");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

//! Routes for mold filling
router.route("/filledNewMould").post(isAuthenticatedUser, mouldDataValidation,filledNewMould)
router.route("/getMouldData").get(isAuthenticatedUser,getMouldData)
router.route("/admin/deleteMouldData/:id").delete(isAuthenticatedUser,deleteMouldData)
router.route("/admin/updateMouldFillingData/:id").put(isAuthenticatedUser,updateMouldFillingData)
router.route("/admin/getNoOfBagUsedInMouldFilling").get(isAuthenticatedUser,getNoOfBagUsedInMouldFilling)

//! Routes for type of mould 
router.route("/admin/addNewTypeOfMould").post(isAuthenticatedUser,addNewTypeOfMould)
router.route("/admin/getTypeOfMould").get(isAuthenticatedUser,getTypeOfMould)
router.route("/admin/deleteTypeOfMould/:id").delete(isAuthenticatedUser,deleteTypeOfMould)

module.exports = router