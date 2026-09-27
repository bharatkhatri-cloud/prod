import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import { fetchJamPreparationData} from '../../reduxStore/JamPreparation/JamPreparationSlice';
import Pagination from '../../assets/Pagination';
import convertToIST from '../../assets/FormatTime';

const DataOfJamPreparation = () => {
    const state = useSelector((state) => state.jamPreparationReducer);
    const dispatch = useDispatch();
    const [getAllDataOfPrepareJam, setGetAllDataOfPrepareJam] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
    const [resultPerPage, setResultPerPage] = useState()
    const [queryParams, setQueryParams] = useState({});
    useEffect(() => {
        dispatch(fetchJamPreparationData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllPreparedJam) {
            setGetAllDataOfPrepareJam(state.data.dataOfAllPreparedJam);
        }
    }, [state]);


    useEffect(() => {
        if (state && state.data && state.data.dataOfAllPreparedJam) {
          setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered)
          setResultPerPage(state.data.resultPerPage)
        }
      }, [state]);

    return (
        <>
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block ">
                    <div className="border rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam Id</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam Quantity(in ml.)</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC ID</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC Qty.(in ml)</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam Preparation Date</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam Prepared By</th>
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

                                {getAllDataOfPrepareJam.map((currData,index) => (
                                    <tr className='hover:bg-teal-300' key={currData._id}>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index+1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamQty}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcQty}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{convertToIST(currData.jamPreparationTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamPreparedBy}</td>
                                       
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <Pagination getData={fetchJamPreparationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
    </>
    );
};

export default DataOfJamPreparation;














