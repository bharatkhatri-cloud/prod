import React, { useEffect, useState } from 'react'
import AdminDataOfLcPreparation from './AdminDataOfLcPreparation'
import { useSelector } from 'react-redux'
import { fetchLcPreparationData } from '../../../reduxStore/LcPreparation/LcPreparationSlice';
import FilterData from '../../../assets/FilterData'
import ExportInExcel from '../../../assets/ExportInExcel'
import FormatTime from '../../../assets/FormatTime';
import Pagination from '../../../assets/Pagination';

const AdminLcPreparation = () => {
  const state = useSelector((state) => state.lcPreparationReducer);
  const [data, setData] = useState([])
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
  const [resultPerPage, setResultPerPage] = useState()
  const [queryParams, setQueryParams] = useState({});

  const extraFilters = {
    "lcId": "LC ID",
    "lcQty": "LC Quantity",
    "scId": "SC ID",
    "scQty": "SC Quantity",
    "lcPreparedBy": "Input Person Name"
  };

  useEffect(() => {
    if (state && state.data && state.data.dataOfAllPreparedLc) {
      setAllData(state.data.allFilteredData)
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered)
      setResultPerPage(state.data.resultPerPage)
    }
  }, [state]);

  
useEffect(() => {
  const transformData = allData.map(item => ({
    "LC ID": item.lcId,
    "LC Quantity(in ml)": item.lcQty,
    "SC ID": item.scId,
    "SC Quantity(in ml.)": item.scQty,
    "LC Preparation Date": FormatTime(item.lcPreparationTime),
    "LC Prepared By": item.lcPreparedBy,
  }));

  setData(transformData);
}, [allData]);

  return (
    <>
      <div className='flex justify-between px-3  py-4'>
        <FilterData extraFilters={extraFilters} getData={fetchLcPreparationData}  queryParams={queryParams} setQueryParams={setQueryParams} />
        <ExportInExcel data={data}/>
      </div>
      <AdminDataOfLcPreparation queryParams={queryParams}/> {/*  //* data of this component is fetched from the Redux Store, so data will modified/filtered based on the query params */}
      <Pagination getData={fetchLcPreparationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
    </>
  )
}

export default AdminLcPreparation
