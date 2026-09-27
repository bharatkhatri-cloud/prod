import React from 'react'
import Navbar from '../../assets/Navbar'
import { Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import QrCodeGeneration from './index'
import Logout from '../../assets/Logout'
import Login from '../../assets/Login'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInQrCodeGeneration = () => {
  
  return (
    <>
     
      <Navbar moduleName={"QR Code Generator"} home={"/"} showData={false} />
        <Routes>
          <Route path="/" element={<QrCodeGeneration />}/>
          <Route path="/myProfile" element={< ProfileCard />} />
          {/* This path opens the notifications list for our users. */}
          <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
        </Routes>
     
    </>
  )
}

export default NavigateInQrCodeGeneration
