import React from 'react'
import Navbar from '../../assets/Navbar'
import {  Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
import Ovens from './Ovens'
import BatchesInOven from './BatchesInOven'
import PlaceNewPiecesInOven from './PlaceNewPiecesInOven'
import AllOvenInData from './AllOvenInData'
import OvenDataReport from './OvenDataReport'
import ViewDataOfOvenIn from './ViewDataOfOvenIn'
import ViewOvenBatchReport from './ViewOvenBatchReport'
import ViewFgData from './ViewFgData'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInMouldIncubation = () => {
    return (
        <>

                <Navbar
                    moduleName="Oven In"
                    home="/"
                    viewData="/view-oven-in-batches"
                    fgData="/view-fg-data"
                    bgNavClass="bg-white border-b border-gray-100 shadow-sm"
                    textBrandClass="text-gray-800"
                    textSubBrandClass="text-orange-500 font-semibold"
                    btnToggleClass="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    listClass="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-white md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white"
                    activeLinkClass="text-orange-600 font-bold bg-orange-50 md:bg-transparent md:text-orange-600"
                    inactiveLinkClass="text-gray-600 hover:bg-gray-50 hover:text-orange-600 md:hover:bg-transparent md:hover:text-orange-500"
                    logoutClass="block py-2 px-3 text-gray-600 rounded hover:bg-gray-50 hover:text-orange-600 md:hover:bg-transparent md:border-0 md:hover:text-orange-500 md:p-0 transition-colors duration-200"
                />
                <Routes>
                    <Route path="/" element={<Ovens />} />
                    <Route path="/batches/:serialNo" element={<BatchesInOven />} />
                    <Route path="/place-mould/create" element={<PlaceNewPiecesInOven />} />
                    <Route path="/place-mould/batch/:batchId" element={<PlaceNewPiecesInOven />} />
                    <Route path="/view-oven-in-batches" element={<AllOvenInData />} />
                    <Route path="/ovenDataReport" element={<OvenDataReport />} />
                    <Route path="/batches/get-data" element={<ViewDataOfOvenIn />} />
                    <Route path="/batch/get-report/:batchId" element={<ViewOvenBatchReport />} />
                    <Route path="/view-fg-data" element={<ViewFgData />} />
                    <Route path="/myProfile" element={<ProfileCard />} />
                    {/* This path opens the notifications list for our users. */}
                    <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            
        </>
    )
}

export default NavigateInMouldIncubation
