import Navbar from '../../assets/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProfileCard from '../../assets/Profile'
import Logout from '../../assets/Logout'
import Login from '../../assets/Login'
import FillNewMould from './FillNewMould'
import DataOfMouldFilling from './DataOfMouldFilling'
import NavigateMFGrowthBatch from './MouldGrowth/NavigateMFGrowthBatch'
// We import the notifications page so the user can look at their messages.
import NotificationsCenter from '../../assets/NotificationsCenter'

const NavigateInMouldFilling = () => {
  const mfExtraLinks = [
    { to: "/fill-mould", label: "Fill Moulds (Mix & Bag)" },
    { to: "/viewDataOfMouldFilling", label: "Mould Records" }
  ];

  return (
    <>
      <Navbar 
        moduleName={"Mould Filling"} 
        home={"/mould-filling"} 
        viewData={"/mould-filling/batch-data"}
        extraLinks={mfExtraLinks}
      />
        <Routes>
          <Route path="/" element={<Navigate to="/mould-filling" replace />} />
          <Route path="/fill-mould" element={<FillNewMould />} />
          <Route path="/viewDataOfMouldFilling" element={<DataOfMouldFilling />} />
          <Route path="/myProfile" element={<ProfileCard />} />
          <Route path="/notifications" element={<NotificationsCenter dashboardPath="/" />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/logout" element={<Logout />}/>
          <Route path="/mould-filling/*" element={<NavigateMFGrowthBatch />} />
        </Routes>
    </>
  )
}

export default NavigateInMouldFilling

