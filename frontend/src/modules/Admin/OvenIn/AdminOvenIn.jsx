import React, { useState } from 'react'
import AdminDataOfOvenin from './AdminDataOfOvenIn'
import Pagination from '../../../assets/Pagination';
import { fetchOvenInData } from '../../../reduxStore/OvenIn/OvenInSlice';
import OvenTopBar from './OvenTopBar';

const AdminOvenIn = () => {

  const [totalNumberOfData, setTotalNumberOfData] = useState(0); // Ensure initialized to 0
  const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
 

  return (
    <>
     <OvenTopBar />

    <AdminDataOfOvenin/>
    <Pagination getData={fetchOvenInData} totalData={totalNumberOfData} resultPerPage={resultPerPage} />


      
    </>
  )
}

export default AdminOvenIn
