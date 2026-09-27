import React from 'react'
import Navbar from '../../assets/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import RejectNewMould from './RejectNewMould'
import DataOfMouldRejection from './DataOfMouldRejection'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInMouldRejection = () => {
  return (
    <>
      {/* <BrowserRouter> */}
        <Navbar moduleName={"Mould Rejection"} home={"/"} viewData={"/viewDataOfMouldRejection"} />
        <Routes>
          <Route path="/" element={<RejectNewMould />} />
          <Route path="/viewDataOfMouldRejection" element={< DataOfMouldRejection />} />
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

export default NavigateInMouldRejection
