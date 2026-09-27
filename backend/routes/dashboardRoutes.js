const express = require("express");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { getDataOfAllModules, getDataOfLcModules, getDataOfBagModules, getDataOfMouldModules } = require("../controller/dashboard");
const router = express.Router();

router.route("/admin/getDataOfAllModules").get(isAuthenticatedUser,getDataOfAllModules)
router.route("/admin/getDataOfLcModules").get(isAuthenticatedUser,getDataOfLcModules)
router.route("/admin/getDataOfBagModules").get(isAuthenticatedUser,getDataOfBagModules)
router.route("/admin/getDataOfMouldModules").get(isAuthenticatedUser,getDataOfMouldModules)


module.exports = router