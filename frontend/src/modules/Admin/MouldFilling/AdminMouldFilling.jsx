import React, { useEffect, useState } from 'react'
import AdminDataOfMouldFilling from './AdminDataOfMouldFilling'
import { useSelector } from 'react-redux';
import Pagination from '../../../assets/Pagination';
import { fetchToGetMouldFillingDataV2 } from '../../../reduxStore/MouldFilling/MouldFillingSlice';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import FormatTime from '../../../assets/FormatTime';
import AdminTypeOfMould from './AdminTypeOfMould';
import MouldTopBar from './MouldTopBar';


const AdminMouldFilling = () => {
  const state = useSelector((state) => state.mouldFillingReducer);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(0); // Ensure initialized to 0
  const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
  const [queryParams, setQueryParams] = useState({});

  const extraFilters = {
    "mouldId": "Mould ID",
    "bagId": "Bag ID",
    "typeOfMould": "Type Of Mould",
    "filledBy": "Mould Filled By",
  };

  
  useEffect(() => {
    if (state && state.data && state.data.mouldFillingData) {
      setAllData(state.data.mouldFillingData);
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0);
      setResultPerPage(state.data.resultPerPage || 0);
    }
  }, [state]);

  useEffect(() => {
    const transformData = allData.map(item => ({
      "Mould ID": item.mouldId,
      "Bag ID": item.bagId,
      "Type of Mould": item.typeOfMould,
      "Mould Filling Date": FormatTime(item.fillingDate),
      "Mould Filled By": item.filledBy,
      "LC/Jam ID": item.previousStatusTillBagInoculation?.JamOrLcId,
    }));

    setData(transformData);
  }, [allData]);



  return (
    <>
    <MouldTopBar/>

    {/* <AdminTypeOfMould/> */}

    <div className='flex justify-between px-3 py-4'>
        <FilterData extraFilters={extraFilters} getData={fetchToGetMouldFillingDataV2} queryParams={queryParams} setQueryParams={setQueryParams} />
        <ExportInExcel data={data} />
    </div>
     <AdminDataOfMouldFilling queryParams={queryParams}/>

     <Pagination getData={fetchToGetMouldFillingDataV2} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
     {/* <Pagination getData={fetchBagInoculationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/> */}

    </>
  )
}

export default AdminMouldFilling
