import React from 'react'
import Navbar from '../../assets/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import DeMouldNewPiece from './DeMouldNewPiece'
import DataOfDeMouldingPieces from './DataOfDeMouldingPieces'
import Logout from '../../assets/Logout'
import Login from '../../assets/Login'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInDeMoulding = () => {

 return (
    <>
       {/* <BrowserRouter> */}
      <Navbar moduleName={"De-Moulding Pieces"} home={"/"} viewData={"/viewDataOfDeMouldingPieces"}/>
        <Routes>
          <Route path="/" element={<DeMouldNewPiece />}/>
          <Route path="/viewDataOfDeMouldingPieces" element={< DataOfDeMouldingPieces/>}/>
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

export default NavigateInDeMoulding
