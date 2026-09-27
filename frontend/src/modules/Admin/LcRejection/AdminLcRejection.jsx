import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AdminDataOfLcRejection from './AdminDataOfLcRejection';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import Pagination from '../../../assets/Pagination';
import { fetchToGetLcRejectionData } from '../../../reduxStore/LcRejection/LcRejectionSlice';
import FormatTime from '../../../assets/FormatTime';

const AdminLcRejection = () => {
  const state = useSelector((state) => state.lcRejectionReducer);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState() // Ensure initialized to 0
  const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
  const [queryParams, setQueryParams] = useState({});

  const extraFilters = {
    "lcId": "LC ID",
    "reasonOfRejection": "Reason Of Rejection",
    "lcRejectedBy": "Input Person Name"
  };

  useEffect(() => {
    if (state?.data?.dataOfAllRejectedLc) {
      setAllData(state.data.allFilteredData);
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered); // Fallback to 0 if undefined
      setResultPerPage(state.data.resultPerPage); // Fallback to 0 if undefined
    }
  }, [state]);

  useEffect(() => {
    const transformData = allData.map(item => ({
      "LC ID": item.lcId,
      "Reason Of Rejection": item.reasonOfRejection,
      "LC Rejected By": item.lcRejectedBy,
      "Lc Quantity": item.previousStatusTillLCPreparation.lcQty,
      "SC ID": item.previousStatusTillLCPreparation.scId,
      "SC Quantity": item.previousStatusTillLCPreparation.scQty,
      "LC Preparation Time": FormatTime(item.previousStatusTillLCPreparation.lcPreparationTime),
      "LC Rejection Time": FormatTime(item.lcRejectionTime),
    }));

    setData(transformData);
  }, [allData]);

  return (
    <div className="min-h-screen bg-gray-50/20 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">LC Rejection Log</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Audit trails and quality control tracking records of rejected Liquid Culture batches.
            </p>
          </div>
        </div>

        {/* Action Panel: Filters & Export */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <FilterData extraFilters={extraFilters} getData={fetchToGetLcRejectionData} queryParams={queryParams} setQueryParams={setQueryParams} />
          </div>
          <div className="shrink-0 self-end sm:self-center">
            <ExportInExcel data={data} />
          </div>
        </div>

        {/* Table List Component */}
        <AdminDataOfLcRejection queryParams={queryParams} />

        {/* Pagination Section */}
        <div className="flex justify-center pt-2">
          <Pagination getData={fetchToGetLcRejectionData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} />
        </div>

      </div>
    </div>
  );
};

export default AdminLcRejection;
