import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import { fetchAllOvenOutData } from '../../../reduxStore/OvenOut/OvenOutSlice';


const AdminDataOfOvenOut = () => {
    const state = useSelector((state) => state.ovenOutReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

    useEffect(() => {
        dispatch(fetchAllOvenOutData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.ovenOutData) {
            setGetAllDataFromCollection(state.data.ovenOutData);
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
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S. No.</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">FG IDs</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Type Of FG</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Out Time</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Out By</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Oven No.</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Oven In Batch ID</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {state.isLoading &&
                                        <tr>
                                            <td colSpan={'9'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                                                <Loader />
                                            </td>
                                        </tr>
                                    }

                                    {(Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).map((currData,index) => (
                                        <tr className='hover:bg-teal-300' key={currData._id}>
                                            
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index +1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.smFgId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.quality}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData?.outTime)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.outBy}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.ovenSerialNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.batchIdOfOvenIn}</td>
                                                </>
                                          
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            </>
    )
}


export default AdminDataOfOvenOut
