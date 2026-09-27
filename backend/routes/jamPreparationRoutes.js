const express = require("express");
const { 
    prepareNewJam, 
    getAllDataOfPreparedJam, 
    deleteTheDataOfPreparedJam, 
    updateDataOfPreparedJam 
} = require("../controller/jamPreparation");
const jamPreparationZodSchema = require("../validators/jamPreparationValidators");
const validate = require("../middleware/validateMiddlewares");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

const router = express.Router();

// POST route with validation middleware
router.route("/prepareNewJam").post(isAuthenticatedUser, prepareNewJam);

// GET route to get all prepared jam data
router.route("/getAllDataOfPreparedJam").get(isAuthenticatedUser,getAllDataOfPreparedJam);

// DELETE route to delete prepared jam data by ID
router.route("/admin/deleteTheDataOfPreparedJam/:id").delete(isAuthenticatedUser,deleteTheDataOfPreparedJam);

// PUT route to update prepared jam data by ID
router.route("/admin/updateDataOfPreparedJam/:id").put(isAuthenticatedUser,updateDataOfPreparedJam);



module.exports = router;
