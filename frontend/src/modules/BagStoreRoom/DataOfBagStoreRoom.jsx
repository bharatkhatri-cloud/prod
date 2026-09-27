import { useDispatch, useSelector } from "react-redux";
import { fetchBagIncubationData } from '../../reduxStore/Incubation/IncubationSlice';
import { useEffect, useState } from 'react';
import Loader from '../../assets/Loader';
import FormatTime from '../../assets/FormatTime';
import Pagination from "../../assets/Pagination";

function DataOfBagStoreRoom() {
  const state = useSelector((state) => state.bagIncubationReducer);

  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
  const [resultPerPage, setResultPerPage] = useState()
  const [queryParams, setQueryParams] = useState({});

  useEffect(() => {
    dispatch(fetchBagIncubationData());   
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.dataOfRejectedBag) {
      setGetAllDataFromCollection(state.data.dataOfRejectedBag);
    }
  }, [state]);



  useEffect(() => {
      if (state && state.data && state.data.dataOfRejectedBag) {
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
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Bag Id</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">REASON</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">REJECTION DATE</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag Qty.(in gm)</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Lc/Jam Id</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Lc/Jam Qty.(ml)</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Bag Placing Date(Bag incubation)</th>
               
                        
                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">
                    {state.isLoading &&
                      <tr>
                        <td colSpan={'8'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                          <Loader />
                        </td>
                      </tr>
                    }

                    {getAllDataFromCollection.map((currItem,index) => (
                      <tr className='hover:bg-teal-300' key={currItem._id}>
                    
                       
                 
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1 }</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.bagId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.reasonOfRejection}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.bagRejectionTime)}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.bagQty}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.JamOrLcId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.JamOrLcQty}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.previousStatusTillBagInoculation?.inoculationTimeStamp)}</td>


                       
                          </>
                     
                      </tr>
                    ))}
                  </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination getData={fetchBagIncubationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
      </>
  );
}

export default DataOfBagStoreRoom;
