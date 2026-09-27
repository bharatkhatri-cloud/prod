import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLcPreparationData, fetchToDeleteLcPreparationData } from '../../../reduxStore/LcPreparation/LcPreparationSlice';
import FormatTime from '../../../assets/FormatTime'
import UpdateData from '../../../assets/UpdateData';

const AdminDataOfLcPreparation = ({queryParams}) => {
    const state = useSelector((state) => state.lcPreparationReducer); // Adjusted the selector name
    const dispatch = useDispatch();
    const [getAllDataOfPrepareLc, setGetAllDataOfPrepareLc] = useState([]);
      

    useEffect(() => {
        dispatch(fetchLcPreparationData()); //! Four
    }, []);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllPreparedLc) {
        setGetAllDataOfPrepareLc(state.data.dataOfAllPreparedLc);        
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {
            dispatch(fetchToDeleteLcPreparationData(id)).then(() => {
                dispatch(fetchLcPreparationData(queryParams));
            });
        }
    }


    //? Update data thing 
    const [url , setUrl] = useState()
    const [moduleData , setModuleData] = useState({
        "lcId": "LC ID",
        "lcQty": "LC Quantity(in ml)",
        "scId": "SC ID",
        "scQty": "SC Quantity(in ml.)",
    })
    const [inputModuleData , setInputModuleData] = useState({
        lcId: "",
        lcQty: "",
        scId: "",
        scQty: ""
    })
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateData = (id, currData) => {
        setIsModalOpen(true)

        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateTheDataOfPreparedLc/${id}`;
        setUrl(url);

        const currentData = {
            lcId: currData.lcId,
            lcQty: currData.lcQty,
            scId: currData.scId,
            scQty: currData.scQty
        }
        setInputModuleData(currentData)
       
    }

    return (
        <>
    

            <UpdateData   moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchLcPreparationData} queryParams={queryParams}/>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block">
                        <div className="border rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC ID</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC Quantity(in ml)</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">SC Id</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">SC Quantity(in ml.)</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC Preparation Date</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC Prepared By</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remove</th>
                                        <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                   

                                    {getAllDataOfPrepareLc.map((currData, index) => (
                                        <tr className='hover:bg-teal-300' key={currData._id}>

                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcQty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.scId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.scQty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                    <div>{FormatTime(currData.lcPreparationTime)}</div>
                                                    {currData?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currData?.updatedAt)})</span>}

                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcPreparedBy}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                    <button type="button" onClick={() => { deleteData(currData._id) }} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none">
                                                        Remove
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                    <button type="button" onClick={() => { updateData(currData._id, currData) }} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-green-600 hover:text-green-800 disabled:opacity-50 disabled:pointer-events-none">Edit</button>
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

export default AdminDataOfLcPreparation;
