import { configureStore } from "@reduxjs/toolkit";
import jamPreparationReducer from "./JamPreparation/JamPreparationSlice";
import lcPreparationReducer from "./LcPreparation/LcPreparationSlice";
import lcRejectionReducer from "./LcRejection/LcRejectionSlice";
import bagInoculationReducer from "./BagInoculation/BagInoculationSlice";
import bagIncubationReducer from "./Incubation/IncubationSlice";
import mouldFillingReducer from "./MouldFilling/MouldFillingSlice";
import mouldRejectionReducer from "./MouldRejection/MouldRejectionSlice";
import TypeOfMouldReducer from "./MouldFilling/TypeOfMouldSlice";
import deMouldingPieceReducer from "./DeMouldingPieces/DeMouldingPieceSlice";
import userAuthReducer from "./authentication/userAuthSlice";
import growthChamberReducer from "./Humidifier/HumidifierSlice";
import smFgGrowthReducer from "./Humidifier/SmFgGrowthSlice";
import humidifierReducer from "./GrowthChamber/HumidifierSlice";
import humidifierDataReducer from "./GrowthChamber/HumidiferDataSlice";
import humidifierMouldInfoReducer from "./GrowthChamber/HumidifierMouldInfoSlice";
import ovenInReducer from "./OvenIn/OvenInSlice";
import ovenReducer from "./OvenIn/OvenSlice";
import fgDataReducer from "./OvenIn/FgDataSlice";
import ovenOutReducer from "./OvenOut/OvenOutSlice";
import dashboardReducer from "./Dashboard/DashboardSlice";
import growthBatchDataReducer from "./MouldFilling/GrowthBatchDataSlice";
import smfgBatchDataReducer from "./Humidifier/SmfgBatchDataSlice";
import notificationsReducer from "./Notifications/NotificationsSlice";

export const rdxStore = configureStore({
    reducer: {
        jamPreparationReducer: jamPreparationReducer,
        lcPreparationReducer: lcPreparationReducer,
        lcRejectionReducer: lcRejectionReducer,
        bagInoculationReducer: bagInoculationReducer,
        bagIncubationReducer: bagIncubationReducer,
        mouldFillingReducer: mouldFillingReducer,
        mouldRejectionReducer: mouldRejectionReducer,
        TypeOfMouldReducer: TypeOfMouldReducer,
        deMouldingPieceReducer: deMouldingPieceReducer,
        userAuthReducer: userAuthReducer,
        growthChamberReducer: growthChamberReducer,
        smFgGrowthReducer: smFgGrowthReducer,
        humidifierReducer: humidifierReducer,
        humidifierDataReducer: humidifierDataReducer,
        humidifierMouldInfoReducer: humidifierMouldInfoReducer,
        ovenReducer: ovenReducer,
        ovenInReducer: ovenInReducer,
        fgDataReducer: fgDataReducer,
        ovenOutReducer: ovenOutReducer,
        dashboardReducer: dashboardReducer,
        growthBatchDataReducer: growthBatchDataReducer,
        smfgBatchDataReducer: smfgBatchDataReducer,
        notificationsReducer: notificationsReducer,
    }
});
