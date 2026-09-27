import React from 'react'
import Navbar from '../../assets/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
import NavigateSmFgGrowthBatch from './SmFgGrowth/NavigateSmFgGrowthBatch'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInGrowthChamber = () => {
    return (
        <>
            {/* <BrowserRouter> */}
                <Navbar moduleName={"Humidifier"} home={"/smfg-growth"} showData={false} smfgData={"/smfg-growth/batch-data"} />
            {/* <PlaceMouldInHumidifier/> */}
                <Routes>
                    <Route path="/" element={<Navigate to="/smfg-growth" replace />} />
                    <Route path="/smfg-growth/*" element={<NavigateSmFgGrowthBatch />} />

                    <Route path="/myProfile" element={< ProfileCard />} />
                    {/* This path opens the notifications list for our users. */}
                    <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            {/* </BrowserRouter> */}
        </>
    )
}

export default NavigateInGrowthChamber
