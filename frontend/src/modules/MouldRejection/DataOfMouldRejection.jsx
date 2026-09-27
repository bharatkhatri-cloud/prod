import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import FormatTime from '../../assets/FormatTime';
import Pagination from '../../assets/Pagination';
import { fetchToGetRejectedMouldData } from '../../reduxStore/MouldRejection/MouldRejectionSlice';

const DataOfMouldRejection = () => {
    const state = useSelector((state) => state.mouldRejectionReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
    const [resultPerPage, setResultPerPage] = useState()
    const [queryParams, setQueryParams] = useState({});

    console.log("PIPIPIPI");
    
    useEffect(() => {
        dispatch(fetchToGetRejectedMouldData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.mouldRejectedData) {
            setGetAllDataFromCollection(state.data.mouldRejectedData);
        }
    }, [state]);


    useEffect(() => {
        if (state && state.data && state.data.mouldRejectedData) {
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
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould ID</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Reason Of Rejection</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Type Of Mould</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Rejection Time</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Filling Time</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Rejected By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {state.isLoading &&
                                        <tr>
                                            <td colSpan={'6'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                                                <Loader />
                                            </td>
                                        </tr>
                                    }

                                    {(Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).map((currData, index) => (
                                        <tr className='hover:bg-teal-300' key={currData._id}>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.mouldId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.mouldRejectionReason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.typeOfMould}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData?.mouldRejectionDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData?.fillingDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.mouldRejectedBy}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Pagination getData={fetchToGetRejectedMouldData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} />

            {/* <Pagination getData={fetchBagInoculationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} /> */}
        </>
    );
};

export default DataOfMouldRejection;
