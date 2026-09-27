const express = require("express");
const { prepareNewLc, getAllDataOfPreparedLc, deleteTheDataOfPreparedLc, updateTheDataOfPreparedLc } = require("../controller/lcPreparation");
const lcPreparationZodSchema = require("../validators/lcPreparationValidators");
const validate = require("../middleware/validateMiddlewares");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/prepareNewLc").post(isAuthenticatedUser,prepareNewLc)
router.route("/getAllDataOfPreparedLc").get(isAuthenticatedUser,getAllDataOfPreparedLc)
router.route("/admin/deleteTheDataOfPreparedLc/:id").delete(isAuthenticatedUser,deleteTheDataOfPreparedLc)
router.route("/admin/updateTheDataOfPreparedLc/:id").put(isAuthenticatedUser,updateTheDataOfPreparedLc)


module.exports = router