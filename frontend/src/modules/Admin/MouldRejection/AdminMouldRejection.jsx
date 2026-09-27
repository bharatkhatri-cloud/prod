import React, { useEffect, useState } from 'react'
import AdminDataOfMouldIncubation from './AdminDataOfMouldRejection'
import { useSelector } from 'react-redux';
import FormatTime from '../../../assets/FormatTime';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import Pagination from '../../../assets/Pagination';
import { fetchToGetRejectedMouldData } from '../../../reduxStore/MouldRejection/MouldRejectionSlice';


const AdminMouldIncubation = () => {
  const state = useSelector((state) => state.mouldRejectionReducer);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(); // Ensure initialized to 0
  const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
  const [queryParams, setQueryParams] = useState({});
  
  
  const extraFilters = {
    "mouldId": "Mould ID",
    "reasonOfRejection": "Reason Of Rejection",
    "mouldRejectedBy":"Mould Rejected By",
  };


  useEffect(() => {
    if (state && state.data && state.data.mouldRejectedData) {
      setAllData(state.data.allFilteredData);
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0); // Fallback to 0 if undefined
      setResultPerPage(state.data.resultPerPage || 0); // Fallback to 0 if undefined
    }
  }, [state]);

  useEffect(() => {
    const transformData = allData.map(item => ({
      "Mould ID": item.mouldId,
      "Reason Of Rejection": item.mouldRejectionReason,
      "Type of Mould": item.typeOfMould,
      "Mould Rejection Date": FormatTime(item.mouldRejectionDate),
      "Mould Filling Date": FormatTime(item.fillingDate),
      "Mould Rejected By": item.mouldRejectedBy,
    }));

    setData(transformData);
  }, [allData]);


  return (
    <>




      <div className='flex justify-between px-3 py-4'>
        <FilterData extraFilters={extraFilters} getData={fetchToGetRejectedMouldData} queryParams={queryParams} setQueryParams={setQueryParams} />
        <ExportInExcel data={data} />
      </div>
      <AdminDataOfMouldIncubation queryParams={queryParams}/>
      <Pagination getData={fetchToGetRejectedMouldData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>



    </>
  )
}

export default AdminMouldIncubation
