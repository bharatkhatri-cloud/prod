const express = require("express");
const { rejectedBag, getBagIncubationData, updateBagIncubationData, deleteBagIncubationData } = require("../controller/bagIncubation");
const validate = require("../middleware/validateMiddlewares");
const bagIncubationZodSchema = require("../validators/bagIncubationValidators");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/rejectBag/new").post(isAuthenticatedUser,validate(bagIncubationZodSchema),rejectedBag)
router.route("/getBagIncubationData").get(isAuthenticatedUser,getBagIncubationData)
router.route("/admin/updateBagIncubationData/:id").put(isAuthenticatedUser,validate(bagIncubationZodSchema),updateBagIncubationData)
router.route("/admin/deleteBagIncubationData/:id").delete(isAuthenticatedUser,deleteBagIncubationData)

module.exports = router

