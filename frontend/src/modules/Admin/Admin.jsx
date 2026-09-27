import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminModuleNavigation from "./AdminModuleNavigation"
import AdminNavbar from "./AdminNavbar"
import ProfileCard from '../../assets/Profile'
import AdminJamPreparation from "./JamPreparation/AdminJamPreparation";
import AdminLcPreparation from "./LcPreparation/AdminLcPreparation";
import AdminLcRejection from "./LcRejection/AdminLcRejection";
import AdminBagInoculation from "./BagInoculation/AdminBagInoculation";
import AdminBagStoreRoom from "./BagStoreRoom/AdminBagStoreRoom";
import AdminMouldFilling from "./MouldFilling/AdminMouldFilling";
import AdminMouldRejection from "./MouldRejection/AdminMouldRejection";
import AdminOvenIn from "./OvenIn/AdminOvenIn";
import OvenDataReport from "./OvenIn/OvenDataReport";
import AdminOvenOut from "./OvenOut/AdminOvenOut";
import Login from "../../assets/Login";
import AdminDataOfUsers from "./User/AdminDataOfUsers";
import Logout from "../../assets/Logout";
import AdminTypeOfMould from "./MouldFilling/AdminTypeOfMould";
import Footer from "../Footer";
import Dashboard from "./Dashboard/Dashboard";
import AdminNotifications from "./Notifications/AdminNotifications";
import AdminHumidifier from "./GrowthChamber/AdminHumidifier";
import AdminHumidifierStatus from "./GrowthChamber/AdminHumidifierStatus";
import AdminHumidifiersData from "./GrowthChamber/AdminHumidifiersData";
import AdminHumidifierMouldInfo from "./GrowthChamber/AdminHumidifierMouldInfo";
import AdminHumidifierGrowthData from "./GrowthChamber/AdminHumidifierGrowthData";
import AdminOven from "./OvenIn/AdminOven";
import ViewFgData from "../OvenIn/ViewFgData";
import ViewOvenBatchReport from "../OvenIn/ViewOvenBatchReport";
import AdminDeMouldingPieces from "./DeMouldingPieces/AdminDeMouldingPieces";
import PageNotFound from "../../assets/PageNotFound";
import QrCodeGeneration from "./QrCodeGeneration";
import BagScanned from "./MouldFilling/BagScanned";
import AccessUserInfo from "./User/AccessUserInfo";
import AdminSettings from "./Settings/AdminSettings";



function Admin() {
  return (
    <>
      {/* <BrowserRouter> */}


      <AdminNavbar />
      <Routes>
        <Route path="/" element={<AdminModuleNavigation />} />


        <Route path="/admin/dashboard" element={< Dashboard />} />
        <Route path="/admin/jamPreparation" element={< AdminJamPreparation />} />
        <Route path="/admin/lcPreparation" element={< AdminLcPreparation />} />
        <Route path="/admin/lcRejection" element={< AdminLcRejection />} />
        <Route path="/admin/bagInoculation" element={<AdminBagInoculation />} />
        <Route path="/admin/bagStoreRoom" element={<AdminBagStoreRoom />} />

        <Route path="/admin">
          <Route path="mouldFilling" element={<AdminMouldFilling />} />
          <Route path="scannedBag" element={<BagScanned />} />
          <Route path="typeOfMould" element={<AdminTypeOfMould />} />
        </Route>

        <Route path="/admin/mouldRejection" element={<AdminMouldRejection />} />


        <Route path="/admin/deMouldingPiece" element={<AdminDeMouldingPieces />} />

        <Route path="/admin">
          <Route path="humidifier" element={<AdminHumidifier />} />
          <Route path="humidifierStatus" element={<AdminHumidifierStatus />} />
          <Route path="humidifer/batch-data" element={<AdminHumidifiersData />} />
          <Route path="humidifer/mould-info" element={<AdminHumidifierMouldInfo />} />
        </Route>
        <Route path="/growthData" element={<AdminHumidifierGrowthData />} />



        {/* //! Oven  In */}
        <Route path="/admin">
          <Route path="oven" element={< AdminOven />} />
          <Route path="ovensData" element={<AdminOvenIn />} />
          <Route path="ovenDataReport" element={<OvenDataReport />} />
          <Route path="fgData" element={<ViewFgData />} />
        </Route>

        <Route path="/batch/get-report/:batchId" element={<ViewOvenBatchReport />} />



        <Route path="/admin/ovenOut" element={<AdminOvenOut />} />
        <Route path="/admin/user" element={<AdminDataOfUsers />} />
        <Route path="/admin/myProfile" element={<ProfileCard />} />
        <Route path="/admin/logout" element={<Logout />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/qrCodeGen" element={<QrCodeGeneration />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="*" element={<PageNotFound />} />

        <Route path="/access-user-info" element={<AccessUserInfo />} />

      </Routes>

      {/* <Routes path="/admin/login" element={<Login />} /> */}
      <Footer />
      {/* </BrowserRouter> */}
    </>
  );
}

export default Admin;
