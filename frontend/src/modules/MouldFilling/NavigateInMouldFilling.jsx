import Navbar from '../../assets/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import Logout from '../../assets/Logout'
import Login from '../../assets/Login'
import NavigateMFGrowthBatch from './MouldGrowth/NavigateMFGrowthBatch'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInMouldFilling = () => {
  
  return (
    <>
       {/* <BrowserRouter> */}
      <Navbar moduleName={"Mould Filling"} home={"/mould-filling"} viewData={"/mould-filling/batch-data"}/>
        <Routes>
          {/* <Route path="/" element={<FillNewMould />}/>
          <Route path="/viewDataOfMouldFilling" element={< DataOfMouldFilling/>}/> */}
          
          <Route path="/" element={<Navigate to="/mould-filling" replace />} />
          <Route path="/myProfile" element={< ProfileCard />} />
          {/* This path opens the notifications list for our users. */}
          <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
          <Route path="/mould-filling/*" element={<NavigateMFGrowthBatch />} />
          
        </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default NavigateInMouldFilling

