import React from 'react'
import Navbar from '../../assets/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import InoculateNewBag from './InoculateNewBag'
import DataOfBagInoculation from './DataOfBagInoculation'
import Login from '../../assets/Login'
import Logout from '../../assets/Logout'
import Footer from '../Footer'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInBagInoculation = () => {
  return (
    <>

      {/* <BrowserRouter> */}
      <Navbar moduleName={"Bag Inoculation"} home={"/"} viewData={"/viewDataOfBagInoculation"}/>
        <Routes>
          <Route path="/" element={<InoculateNewBag />}/>
          <Route path="/viewDataOfBagInoculation" element={< DataOfBagInoculation/>}/>
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

export default NavigateInBagInoculation
