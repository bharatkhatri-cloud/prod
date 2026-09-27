import React, { useEffect, useState } from 'react'
import FilterData from '../../../assets/FilterData'
import ExportInExcel from '../../../assets/ExportInExcel'
import Pagination from '../../../assets/Pagination'
import { useSelector } from "react-redux";
import { fetchBagIncubationData } from '../../../reduxStore/Incubation/IncubationSlice';
import FormatTime from '../../../assets/FormatTime';
import AdminDataOfBagStoreRoom from './AdminDataOfBagStoreRoom'



const AdminBagStoreRoom = () => {
  const state = useSelector((state) => state.bagIncubationReducer)
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState();
  const [resultPerPage, setResultPerPage] = useState(0);
  const [queryParams, setQueryParams] = useState({});

  const extraFilters = {
    "bagId": "Bag Id",
    "reasonOfRejection": "Reason Of Rejection",
    "bagRejectedBy": "Bag Rejected By "
  };


  useEffect(() => {
    if (state && state.data && state.data.dataOfRejectedBag) {
      setAllData(state.data.allFilteredData);
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0);
      setResultPerPage(state.data.resultPerPage || 0);
    }
  }, [state]);


  useEffect(() => {
    const transformData = allData.map(item => ({
      "Bag ID": item.bagId,
      "Reason Of Rejection": item.reasonOfRejection,
      "Bag Rejected By": item.bagRejectedBy,
      "Bag Quantity(in gm.)": item.previousStatusTillBagInoculation?.bagQty,
      "LC/Jam ID": item.previousStatusTillBagInoculation?.JamOrLcId,
      "LC/Jam Quantity(in ml.)": item.previousStatusTillBagInoculation?.JamOrLcQty,
      "Bag Inoculation Time": FormatTime(item.previousStatusTillBagInoculation?.inoculationTimeStamp),
      "Bag Rejection Time": FormatTime(item.bagRejectionTime),
    }));

    setData(transformData);
  }, [allData]);





  return (
    <>



      <div className='flex justify-between px-3  py-4'>
        <FilterData extraFilters={extraFilters} getData={fetchBagIncubationData} queryParams={queryParams} setQueryParams={setQueryParams} />
        <ExportInExcel data={data} />
      </div>

      <AdminDataOfBagStoreRoom queryParams={queryParams}/>
      <Pagination getData={fetchBagIncubationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
      {/* <Pagination getData={fetchBagInoculationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/> */}


    </>
  )
}

export default AdminBagStoreRoom
