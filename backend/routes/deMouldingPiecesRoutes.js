const express = require("express")
const { deMouldNewPiece, getDeMouldPieceData, deleteDeMouldingPieceData, updateDeMouldedPieceData } = require("../controller/deMouldingPieces")
const { isAuthenticatedUser } = require("../middleware/authMiddleware")

const router = express.Router()

router.route("/deMouldNewPiece").post(isAuthenticatedUser,deMouldNewPiece)
router.route("/getDeMouldPieceData").get(isAuthenticatedUser,getDeMouldPieceData)
router.route("/admin/deleteDeMouldingPieceData/:id").delete(isAuthenticatedUser,deleteDeMouldingPieceData)
router.route("/admin/updateDeMouldPieceData/:id").put(isAuthenticatedUser,updateDeMouldedPieceData)




module.exports = router