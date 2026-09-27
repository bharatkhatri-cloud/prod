import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import { fetchToGetLcRejectionData, fetchToDeleteLcRejectionData } from '../../../reduxStore/LcRejection/LcRejectionSlice';
import FormatTime from '../../../assets/FormatTime'
import UpdateData from '../../../assets/UpdateData';

const AdminDataOfLcRejection = ({ queryParams }) => {
    const state = useSelector((state) => state.lcRejectionReducer); // Adjusted the selector name
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);


    useEffect(() => {
        dispatch(fetchToGetLcRejectionData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllRejectedLc) {
            setGetAllDataFromCollection(state.data.dataOfAllRejectedLc);
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {

            dispatch(fetchToDeleteLcRejectionData(id)).then(() => {
                dispatch(fetchToGetLcRejectionData(queryParams));
            });
        }
    }


    //? Update data thing 
    const [url, setUrl] = useState()
    const [moduleData, setModuleData] = useState({
        "lcId": "LC ID",
        "reasonOfRejection": "Reason Of Rejection",

    })
    const [inputModuleData, setInputModuleData] = useState({
        lcId: "",
        reasonOfRejection: "",

    })
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateData = (id, currData) => {
        setIsModalOpen(true)

        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateTheDataOfRejectedLc/${id}`;
        setUrl(url);

        const currentData = {
            lcId: currData.lcId,
            reasonOfRejection: currData.reasonOfRejection,
        }
        setInputModuleData(currentData)

    }

    return (
        <>
            <UpdateData moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchToGetLcRejectionData} queryParams={queryParams} />


            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-100 bg-white">
                                <thead className="bg-gray-50/70 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">S.No.</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC ID</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">Reason Of Rejection</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Rejected By</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Qty (ml)</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Id</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">SC Qty (ml)</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Prep Date</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">LC Reject Date</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Remove</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {state.isLoading &&
                                        <tr className="animate-pulse">
                                            <td colSpan="11" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
                                                Loading rejection records...
                                            </td>
                                        </tr>
                                    }

                                    {!state.isLoading && getAllDataFromCollection.length === 0 && (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-12 text-center text-xs font-bold text-gray-400">
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
                                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">
                                                <div>{FormatTime(currData.lcRejectionTime)}</div>
                                                {currData?.updatedAt && (
                                                    <span className="inline-block mt-1 text-[9px] font-extrabold text-gray-500 bg-gray-100 border border-gray-200/50 px-2 py-0.5 rounded">
                                                        edited ({FormatTime(currData?.updatedAt)})
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                                                <button 
                                                    type="button" 
                                                    onClick={() => deleteData(currData._id)} 
                                                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateData(currData._id, currData)} 
                                                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Edit Record"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default AdminDataOfLcRejection;
