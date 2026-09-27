const express = require("express");
const {getBagInoculatedData, createBagInoculation, updateBagInoculatedData, deleteBagInoculatedData, getSingleBagInoculationData} = require("../controller/bagInoculation");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { bagInoculationLinking } = require("../controller/settings/linking");
const router = express.Router();

router.route("/bagInoculation/new").post(isAuthenticatedUser,bagInoculationLinking,createBagInoculation)
router.route("/getBagInoculatedData").get(isAuthenticatedUser,getBagInoculatedData)
router.route("/admin/deleteBagInoculatedData/:id").delete(isAuthenticatedUser,deleteBagInoculatedData)
router.route("/admin/updateBagInoculatedData/:id").put(isAuthenticatedUser,updateBagInoculatedData)

router.route("/admin/getSingleBagInoculationData/:bagId").get(getSingleBagInoculationData)

module.exports = router

