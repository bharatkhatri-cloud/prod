import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBagInoculationData } from '../../reduxStore/BagInoculation/BagInoculationSlice';
import Loader from '../../assets/Loader';
import FormatTime from '../../assets/FormatTime';
import Pagination from '../../assets/Pagination';

const DataOfBagInoculation = () => {
  const state = useSelector((state) => state.bagInoculationReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
  const [resultPerPage, setResultPerPage] = useState()
  const [queryParams, setQueryParams] = useState({});

  
  useEffect(() => {
    dispatch(fetchBagInoculationData());
  }, [dispatch]);


  useEffect(() => {
    if (state && state.data && state.data.dataOfBagInoculation) {
      setGetAllDataFromCollection(state.data.dataOfBagInoculation);
    }
  }, [state]);




  useEffect(() => {
    if (state && state.data && state.data.dataOfBagInoculation) {
      setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered)
      setResultPerPage(state.data.resultPerPage)
    }
  }, [state]);



  return (
    <>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag ID</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag Quantity</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam/LC ID</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam/LC Quantity</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remark</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Inoculation Time </th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Inoculated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {state.isLoading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                        <Loader />
                      </td>
                    </tr>
                  )}
                  {getAllDataFromCollection.map((e, index) => (
                    <tr className="hover:bg-teal-300" key={e._id}>


                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e.bagId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e.bagQty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e.JamOrLcId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e.JamOrLcQty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e?.remark}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(e.inoculationTimeStamp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{e.inoculatedBy}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Pagination getData={fetchBagInoculationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} />
    </>
  );
}



export default DataOfBagInoculation;
