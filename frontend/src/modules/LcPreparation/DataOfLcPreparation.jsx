import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import { fetchLcPreparationData } from '../../reduxStore/LcPreparation/LcPreparationSlice';
import Pagination from '../../assets/Pagination';
import FormatTime from '../../assets/FormatTime'

const DataOfLcPreparation = () => {
    const state = useSelector((state) => state.lcPreparationReducer); 
    const dispatch = useDispatch();
    const [getAllDataOfPrepareLc, setGetAllDataOfPrepareLc] = useState([]);
    const [totalNumberOfData, setTotalNumberOfData] = useState()
    const [resultPerPage, setResultPerPage] = useState()

    useEffect(() => {
        dispatch(fetchLcPreparationData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllPreparedLc) {
            setGetAllDataOfPrepareLc(state.data.dataOfAllPreparedLc)
            setTotalNumberOfData(state.data.totalLcPreparationData || state.data.totalNoOfDataFiltered || 0)
            setResultPerPage(state.data.resultPerPage)

        }
    }, [state]);

    return (
        <div className="min-h-screen bg-gray-50/20 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">LC Preparation Log</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Comprehensive record of prepared Liquid Culture batches and parent Nutrient Solution allocations.
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
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">S.No</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC ID</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Qty (ml)</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Id</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Qty (ml)</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Prep Date</th>
                                            <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Prepared By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {state.isLoading ? (
                                            <tr className="animate-pulse">
                                                <td colSpan="7" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
                                                    Loading preparation records...
                                                </td>
                                            </tr>
                                        ) : !getAllDataOfPrepareLc || getAllDataOfPrepareLc.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
                                                    No preparation records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            getAllDataOfPrepareLc.map((currData, index) => (
                                                <tr className="hover:bg-gray-50/50 transition-colors" key={currData._id}>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-400 font-bold">{index + 1}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-900 font-extrabold tracking-tight">{currData.lcId}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-semibold">{currData.lcQty}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.scId}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.scQty}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">{FormatTime(currData.lcPreparationTime)}</td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">{currData.lcPreparedBy}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center pt-2">
                    <Pagination getData={fetchLcPreparationData} totalData={totalNumberOfData} resultPerPage={resultPerPage}/>
                </div>

            </div>
        </div>
    );
};

export default DataOfLcPreparation;
