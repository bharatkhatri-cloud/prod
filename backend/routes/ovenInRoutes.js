const express = require("express");
const { addNewOven, getAllOven, deleteOven, middleWareForPieces, ovenInNewPieces, getDataOfOvenBatchWise, getOvenData, removePieceFromOvenBatchWise, batchRemoveFromOven ,  getAllDataOfOvenIn } = require("../controller/ovenIn"); 
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

//Todo : Add , get and remove oven  
router.route('/admin/addNewOven').post(isAuthenticatedUser,addNewOven)
router.route('/getAllOven').get(isAuthenticatedUser, getAllOven)
router.route('/admin/deleteOven/:id').delete(isAuthenticatedUser, deleteOven)

//Todo : Mould Placing and removing from in oven
// router.get("/existenceOfMouldAtOvenIn",isAuthenticatedUser, isMouldExistOrNotInHumidifier);
router.post("/ovenInNewPieces", isAuthenticatedUser, middleWareForPieces,  ovenInNewPieces);
router.get("/getOvenData",isAuthenticatedUser, getOvenData);
router.get("/getDataOfOvenBatchWise",isAuthenticatedUser, getDataOfOvenBatchWise);
router.delete("/removePieceFromOvenBatchWise",isAuthenticatedUser, removePieceFromOvenBatchWise);
router.delete("/batchRemoveFromOven",isAuthenticatedUser, batchRemoveFromOven);

router.get("/getDataOfOvenIn",isAuthenticatedUser, getAllDataOfOvenIn);


module.exports = router;
