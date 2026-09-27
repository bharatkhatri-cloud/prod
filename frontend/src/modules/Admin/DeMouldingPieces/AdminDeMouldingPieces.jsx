import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import Pagination from '../../../assets/Pagination';
import FormatTime from '../../../assets/FormatTime';
import AdminDataOfDeMouldingPieces from './AdminDataOfDeMouldingPieces';
import { fetchDeMouldPiecesData } from '../../../reduxStore/DeMouldingPieces/DeMouldingPieceSlice';

const AdminDeMouldingPieces = () => {
  const state = useSelector((state) => state.deMouldingPieceReducer);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(); // Ensure initialized to 0
  const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
  const [queryParams, setQueryParams] = useState({});

  const extraFilters = {
    "smFgId":"Piece ID",
    "mouldId":"Mould Id",
  };

  useEffect(() => {
    if (state && state.data && state.data.deMouldingPieceData) {
      setAllData(state.data.allFilteredData);
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0); // Fallback to 0 if undefined
      setResultPerPage(state.data.resultPerPage || 0); // Fallback to 0 if undefined
    }
  }, [state]);

  useEffect(() => {
    const transformData = allData.map(item => ({
      "Pieces ID": item.smFgId,
      "Moulds ID": item.mouldId,
      "Pieces De-Moulding Time": FormatTime(item.deMouldingPieceTime),
      "Mould Filling Time": FormatTime(item.previousStatusTillMouldFilling?.fillingDate),
      "Pieces De-Moulded By": item.pieceDeMouldedBy,
    }));

    setData(transformData);
  }, [allData]);

  return (
    <>
  
      <div className='flex justify-between px-3 py-4'>
        <FilterData extraFilters={extraFilters} getData={fetchDeMouldPiecesData} queryParams={queryParams} setQueryParams={setQueryParams} />
        <ExportInExcel data={data} />
      </div>
      <AdminDataOfDeMouldingPieces queryParams={queryParams}/>
      <Pagination getData={fetchDeMouldPiecesData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/> 
    </>
  );
};


export default AdminDeMouldingPieces
