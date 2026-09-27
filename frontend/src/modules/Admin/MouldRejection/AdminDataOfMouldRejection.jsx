import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import UpdateData from '../../../assets/UpdateData';
import { fetchToGetRejectedMouldData ,fetchToDeleteRejectedMould } from '../../../reduxStore/MouldRejection/MouldRejectionSlice';

const AdminDataOfMouldRejection = ({ queryParams }) => {
    const state = useSelector((state) => state.mouldRejectionReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);


    useEffect(() => {
        dispatch(fetchToGetRejectedMouldData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.mouldRejectedData) {
            setGetAllDataFromCollection(state.data.mouldRejectedData);
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {

            dispatch(fetchToDeleteRejectedMould(id)).then(() => {
                dispatch(fetchToGetRejectedMouldData(queryParams));
            });
        }
    };


    //? Update data thing 
    const [url, setUrl] = useState()
    const [moduleData, setModuleData] = useState({
        "mouldId": "Mould ID",
        "mouldRejectionReason": "Reason Of Rejection",

    })
    const [inputModuleData, setInputModuleData] = useState({
        mouldId: "",
        mouldRejectionReason: "",
    })
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateData = (id, currData) => {
        setIsModalOpen(true)

        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateRjectedMould/${id}`;
        // const url = ``;
        setUrl(url);

        const currentData = {
            mouldId: currData.mouldId,
            mouldRejectionReason: currData.mouldRejectionReason,
        }

        setInputModuleData(currentData)

    }


    return (
        <>
            <UpdateData moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchToGetRejectedMouldData} queryParams={queryParams} />

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
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remove</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Update</th>
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

                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.mouldId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.mouldRejectionReason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.typeOfMould}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                    <div>{FormatTime(currData.mouldRejectionDate)} </div>
                                                    {currData?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currData?.updatedAt)})</span>}

                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData?.fillingDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.mouldRejectedBy}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                    <button type="button" onClick={() => { deleteData(currData._id) }} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none">
                                                        Remove
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                    <button type="button" onClick={() => { updateData(currData._id, currData) }} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-green-500 hover:text-green-800 disabled:opacity-50 disabled:pointer-events-none">
                                                        Edit
                                                    </button>
                                                </td>
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
    );
};

export default AdminDataOfMouldRejection;
