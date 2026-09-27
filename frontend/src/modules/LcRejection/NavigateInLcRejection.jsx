import React from 'react'
import Navbar from '../../assets/Navbar'
import { Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import RejectNewLc from './RejectNewLc'
import DataOfLcRejection from './DataOfLcRejection'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInLcRejection = () => {
  return (
    <>

      {/* <BrowserRouter> */}
      <Navbar moduleName={"LC Rejection"} home={"/"} viewData={"/viewDataOfLcRejection"}/>
        <Routes>
          <Route path="/" element={<RejectNewLc />}/>
          <Route path="/viewDataOfLcRejection" element={< DataOfLcRejection/>}/>
          <Route path="/myProfile" element={< ProfileCard />} />
          {/* This path opens the notifications list for our users. */}
          <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
        </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default NavigateInLcRejection
