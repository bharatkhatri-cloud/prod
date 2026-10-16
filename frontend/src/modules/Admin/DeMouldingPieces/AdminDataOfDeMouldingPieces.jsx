import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import { fetchToDeleteDeMouldPiecesData, fetchDeMouldPiecesData } from '../../../reduxStore/DeMouldingPieces/DeMouldingPieceSlice';
import FormatTime from '../../../assets/FormatTime'
import UpdateData from '../../../assets/UpdateData';

const AdminDataOfDeMouldingPieces = ({ queryParams }) => {
    const state = useSelector((state) => state.deMouldingPieceReducer); // Adjusted the selector name
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

    useEffect(() => {
        dispatch(fetchDeMouldPiecesData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.deMouldingPieceData) {
            setGetAllDataFromCollection(state.data.deMouldingPieceData);
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {

            dispatch(fetchToDeleteDeMouldPiecesData(id)).then(() => {
                dispatch(fetchDeMouldPiecesData(queryParams));
            });
        }
    }


    //? Update data thing 
    const [url, setUrl] = useState()
    const [moduleData, setModuleData] = useState({
        "mouldId": "Mould ID",
        "smFgId": "Piece ID"
    })
    const [inputModuleData, setInputModuleData] = useState({
        mouldId: "",
        smFgId: ""
    })
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateData = (id, currData) => {
        setIsModalOpen(true)

        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateDeMouldPieceData/${id}`;
        setUrl(url);

        const currentData = {
            mouldId: currData.mouldId,
            smFgId: currData.smFgId
        }

        setInputModuleData(currentData)

    }

    return (
        <>
            <UpdateData moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchDeMouldPiecesData} queryParams={queryParams} />
            <div className="flex flex-col">
                <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-yellow-50 border border-yellow-400 rounded-lg text-yellow-800">
                    <span className="text-xl">⚠️</span>
                    <span className="font-semibold text-sm">This process is currently not in use and has been removed from the active workflow.</span>
                </div>
                <div className="overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block">
                        <div className="border rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Piece Id</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Id</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mix ID</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">De-Moulding Time</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Mould Filling Time</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">De-Moulded By</th>

                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remove</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {state.isLoading &&
                                        <tr>
                                            <td colSpan={'10'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center mx-auto">
                                                <Loader />
                                            </td>
                                        </tr>
                                    }

                                    {(Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).map((currItem, index) => (
                                        <tr className='hover:bg-teal-300' key={currItem._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border font-mono">{currItem.smFgId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border font-mono">{currItem.mouldId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                {currItem.previousStatusTillMouldFilling?.mixId ? (
                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-teal-100 text-teal-800 font-mono">
                                                        {currItem.previousStatusTillMouldFilling.mixId}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.deMouldingPieceTime)}</td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                <div>{FormatTime(currItem.deMouldingPieceTime)} </div>
                                                {currItem?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currItem?.updatedAt)})</span>}

                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.previousStatusTillMouldFilling?.fillingDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.pieceDeMouldedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                <button type="button" onClick={() => { deleteData(currItem._id) }} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none">
                                                    Remove
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-green-600 hover:text-green-800 disabled:opacity-50 disabled:pointer-events-none" onClick={() => { updateData(currItem._id, currItem) }} >
                                                    Edit
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

export default AdminDataOfDeMouldingPieces

