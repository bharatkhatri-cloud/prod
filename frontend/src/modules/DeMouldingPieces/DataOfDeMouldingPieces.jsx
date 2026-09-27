import React, { useEffect, useState } from 'react'
import FormatTime from '../../assets/FormatTime';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeMouldPiecesData } from '../../reduxStore/DeMouldingPieces/DeMouldingPieceSlice';
import Pagination from '../../assets/Pagination';
import Loader from '../../assets/Loader';

const DataOfDeMouldingPieces = () => {
  const state = useSelector((state) => state.deMouldingPieceReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
  const [resultPerPage, setResultPerPage] = useState()
  const [queryParams, setQueryParams] = useState({});

  useEffect(() => {
    dispatch(fetchDeMouldPiecesData());
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.deMouldingPieceData) {
      setGetAllDataFromCollection(state.data.deMouldingPieceData);
    }
  }, [state]);

  useEffect(() => {
    if (state && state.data && state.data.deMouldingPieceData) {
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered)
      setResultPerPage(state.data.resultPerPage)
    }
  }, [state]);

  return (
    <>
      <div className="flex flex-col">
        <div className=" overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block ">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Piece Id</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Id</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">De-Moulding Time</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Filling Time</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">De-Moulded By</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">
                  {state.isLoading &&
                    <tr>
                      <td colSpan={'8'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center mx-auto">
                        <Loader />
                      </td>
                    </tr>
                  }
                  {getAllDataFromCollection && getAllDataFromCollection.map((currItem, index) => (
                    <tr className='hover:bg-teal-300' key={currItem._id}>
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.smFgId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.mouldId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.deMouldingPieceTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.previousStatusTillMouldFilling?.fillingDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.pieceDeMouldedBy}</td>
                      </>
                    </tr>
                  ))}
                </tbody>


              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination getData={fetchDeMouldPiecesData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} />
    </>
  );
}

export default DataOfDeMouldingPieces
