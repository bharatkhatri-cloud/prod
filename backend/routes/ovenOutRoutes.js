const express = require("express");
const { getAllDataOfOvenOut, definedQualityOfFg, middlewareForOvenOutFg } = require("../controller/ovenOut"); 
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();



router.put("/definedQualityOfFg",isAuthenticatedUser, middlewareForOvenOutFg, definedQualityOfFg);
router.get("/getDataOfOvenOut",isAuthenticatedUser, getAllDataOfOvenOut);



module.exports = router;


