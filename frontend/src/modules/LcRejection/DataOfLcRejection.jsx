import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchToGetLcRejectionData} from '../../reduxStore/LcRejection/LcRejectionSlice';
import Pagination from '../../assets/Pagination';
import FormatTime from '../../assets/FormatTime'

const DataOfLcRejection = () => {
    const state = useSelector((state) => state.lcRejectionReducer); // Adjusted the selector name
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
    const [resultPerPage, setResultPerPage] = useState()
    const [queryParams, setQueryParams] = useState({});
   
    useEffect(() => {
        dispatch(fetchToGetLcRejectionData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllRejectedLc) {
            setGetAllDataFromCollection(state.data.dataOfAllRejectedLc);
        }
    }, [state]);



    useEffect(() => {
        if (state && state.data && state.data.dataOfAllRejectedLc) {
            setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered)
            setResultPerPage(state.data.resultPerPage)
        }
      }, [state]);


    return (
        <div className="min-h-screen bg-gray-50/20 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">LC Rejection Log</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Comprehensive record of rejected Liquid Culture batches and associated Quality Control logs.
                    </p>
                </div>

                {/* Table Data Card */}
                <div className="flex flex-col">
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/70 border-b border-gray-200">
                                        <tr>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">S.No.</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC ID</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">Reason Of Rejection</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Rejected</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Quantity(in ml)</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Id</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Quantity(in ml.)</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Preparation Date</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Rejection Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {state.isLoading &&
                                            <tr className="animate-pulse">
                                                <td colSpan="9" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
                                                    Loading rejection records...
                                                </td>
                                            </tr>
                                        }

                                        {!state.isLoading && getAllDataFromCollection.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
                                                    No rejection records found.
                                                </td>
                                            </tr>
                                        )}

                                        {getAllDataFromCollection.map((currData, index) => (
                                            <tr className="hover:bg-gray-50/50 transition-colors" key={currData._id}>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-400 font-bold">{index + 1}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-900 font-extrabold tracking-tight">{currData.lcId}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-semibold">{currData.reasonOfRejection}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.lcRejectedBy}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.previousStatusTillLCPreparation.lcQty}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.previousStatusTillLCPreparation.scId}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.previousStatusTillLCPreparation.scQty}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">{FormatTime(currData.previousStatusTillLCPreparation.lcPreparationTime)}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">{FormatTime(currData.lcRejectionTime)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center pt-2">
                    <Pagination getData={fetchToGetLcRejectionData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
                </div>

            </div>
        </div>
    );
};

export default DataOfLcRejection;