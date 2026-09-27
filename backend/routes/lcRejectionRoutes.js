const express = require("express");
const { rejectNewLcBottle, getAllDataOfRejectedLc, deleteTheDataOfRejectedLc, updateTheDataOfRejectedLc } = require("../controller/lcRejection");
const validate = require("../middleware/validateMiddlewares");
const lcRejectionZodSchema = require("../validators/lcRejectionValidators");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/rejectNewLcBottle").post(isAuthenticatedUser,validate(lcRejectionZodSchema),rejectNewLcBottle)
router.route("/getAllDataOfRejectedLc").get(isAuthenticatedUser, getAllDataOfRejectedLc)
router.route("/admin/deleteTheDataOfRejectedLc/:id").delete(isAuthenticatedUser,deleteTheDataOfRejectedLc)
router.route("/admin/updateTheDataOfRejectedLc/:id").put(isAuthenticatedUser,validate(lcRejectionZodSchema),updateTheDataOfRejectedLc)


module.exports = router