import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import { fetchToGetMouldFillingData } from '../../reduxStore/MouldFilling/MouldFillingSlice';

import FormatTime from '../../assets/FormatTime';
import Pagination from '../../assets/Pagination';
const DataOfMouldFilling = () => {
    const state = useSelector((state) => state.mouldFillingReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState()
    const [resultPerPage, setResultPerPage] = useState()
    const [queryParams, setQueryParams] = useState({});


    useEffect(() => {
        dispatch(fetchToGetMouldFillingData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.mouldFillingData) {
            setGetAllDataFromCollection(state.data.mouldFillingData);
        }
    }, [state]);




    useEffect(() => {
        if (state && state.data && state.data.mouldFillingData) {
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
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag ID</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Type Of Mould</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Filling Date</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Filled By</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC/Jam ID</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.mouldId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.bagId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.typeOfMould}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData.fillingDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.filledBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.previousStatusTillBagInoculation?.JamOrLcId}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination getData={fetchToGetMouldFillingData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
        </>
    );
};

export default DataOfMouldFilling;
