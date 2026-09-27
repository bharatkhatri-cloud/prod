
import React, { useEffect, useState } from 'react'
import AdminDataOfJamPreparation from './AdminDataOfJamPreparation'
import { fetchJamPreparationData} from '../../../reduxStore/JamPreparation/JamPreparationSlice';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import { useSelector } from 'react-redux';
import Pagination from '../../../assets/Pagination';
import FormatTime from '../../../assets/FormatTime';



const AdminJamPreparation = () => {
const state = useSelector((state) => state.jamPreparationReducer);
const [data, setData] = useState([])
const [allData, setAllData] = useState([]);
const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
const [resultPerPage, setResultPerPage] = useState()
const [queryParams, setQueryParams] = useState({});

const extraFilters = {
  "jamId": "Jam ID",
  "jamQty": "Jam Quantity",
  "lcId": "LC ID",
  "lcQty": "LC Quantity",
  "jamPreparedBy":"Input Person Name"
};

useEffect(() => {
  if (state && state.data && state.data.dataOfAllPreparedJam) {
    setAllData(state.data.allFilteredData);
    setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0)
    setResultPerPage(state.data.resultPerPage || 0)
  }
}, [state]);


useEffect(() => {
  const transformData = allData.map(item => ({
    "Jam ID": item.jamId,
    "Jam Quantity(in ml.)": item.jamQty,
    "LC ID": item.lcId,
    "LC Quantity(in ml)": item.lcQty,
    "Jam Preparation Date": FormatTime(item.jamPreparationTime),
    "Jam Prepared By": item.jamPreparedBy,
  }));

  setData(transformData);
}, [allData]);



  return (
    <>
    







{/* Start:- this for admin only */}
    <div className='flex justify-between px-3  py-4'>
            <FilterData  extraFilters={extraFilters} getData={fetchJamPreparationData}   queryParams={queryParams} setQueryParams={setQueryParams} />
            <ExportInExcel data={data} />
    </div>
    <AdminDataOfJamPreparation  queryParams={queryParams}/>
    <Pagination getData={fetchJamPreparationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>

{/* End:- this for admin only */}










    </>
  )
}

export default AdminJamPreparation
