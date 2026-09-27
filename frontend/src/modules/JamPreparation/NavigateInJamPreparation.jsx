import React from 'react'
import Navbar from '../../assets/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import CreateNewJam from './CreateNewJam'
import DataOfJamPreparation from './DataOfJamPreparation'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
import PageNotFound from '../../assets/PageNotFound'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInJamPreparation = () => {
  return (
    <>
      {/* <BrowserRouter> */}
      <Navbar moduleName={"Jam Preparation"} home={"/"} viewData={"/viewDataOfJamPreparation"}/>
        <Routes>
          <Route path="/" element={<CreateNewJam />}/>
          <Route path="/viewDataOfJamPreparation" element={< DataOfJamPreparation/>}/>
          <Route path="/myProfile" element={< ProfileCard />} />
          {/* This path opens the notifications list for our users. */}
          <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
          <Route path="*" element={<PageNotFound />}/>
        </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default NavigateInJamPreparation
