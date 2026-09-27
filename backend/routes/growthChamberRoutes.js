const express = require('express');
const router = express.Router();
const upload = require('../middleware/s3')
const {addHumidifier,getAllHumidifier,addReadingData,uploadImages,updateOrAddField, getAllHumidifersData, deleteHumidifier, removeReadingData, readingsFinished, checkPiecesExistence, addPiecesToHumidifier, getDataInHumidifier, donePlacingPieces, removePiecesAndUpdateHumidifier, getTimerData } = require('../controller/growthChamber')
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

//Todo : Add , get and remove Humidifier 
router.route('/admin/addHumidifier').post(addHumidifier)
router.route('/humidifier').get(getAllHumidifier)
router.route('/admin/deleteHumidifier/:id').delete(deleteHumidifier)

//Todo : Mould Placing and removing in Humidifier
router.route('/humidifier/placePieces').post(isAuthenticatedUser,checkPiecesExistence,addPiecesToHumidifier)
router.route('/humidifier/dataInHumidifier/:id').get(isAuthenticatedUser,getDataInHumidifier)
router.route('/humidifier/filledCompletely/:id').put(donePlacingPieces)
router.route('/humidifier/moulds').put(addReadingData)
router.route('/humidifier/moulds/removeReadingData').delete(removeReadingData)
router.route('/humidifier/readingsFinished').put(readingsFinished)

router.route('/humidifier').put(isAuthenticatedUser, removePiecesAndUpdateHumidifier)
router.route('/humidifier/updateMould').put(updateOrAddField)
router.route('/humidifier/uploadImages').post(upload.single('image'),uploadImages)

router.route('/humidifier/allMoulds').get(getAllHumidifersData)

//Todo : Route to fetch timer data
router.get("/timer/:dataId", getTimerData);



module.exports = router