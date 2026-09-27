import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import { fetchJamPreparationData, fetchToDeleteJamPreparationData, fetchToUpdateJamPreparationData } from '../../../reduxStore/JamPreparation/JamPreparationSlice';
import FormatTime from '../../../assets/FormatTime';
import UpdateData from '../../../assets/UpdateData';

const AdminDataOfJamPreparation = ({queryParams}) => {
    const state = useSelector((state) => state.jamPreparationReducer);
    const dispatch = useDispatch();
    const [getAllDataOfPrepareJam, setGetAllDataOfPrepareJam] = useState([]);


    useEffect(() => {
        dispatch(fetchJamPreparationData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.dataOfAllPreparedJam) {
            setGetAllDataOfPrepareJam(state.data.dataOfAllPreparedJam);
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {
            
            dispatch(fetchToDeleteJamPreparationData(id)).then(() => {
                dispatch(fetchJamPreparationData(queryParams));
            });
        }
    }



    //? Update data thing 
   const [url , setUrl] = useState()
       const [moduleData , setModuleData] = useState({
           "jamId": "Jam ID",
           "jamQty": "Jam Quantity(in ml)",
           "lcId": "LC ID",
           "lcQty": "LC Quantity(in ml.)",
       })
       const [inputModuleData , setInputModuleData] = useState({
        jamId: "",
        jamQty: "",
        lcId: "",
        lcQty: ""
       })
       const [isModalOpen, setIsModalOpen] = useState(false);
   
       const updateData = (id, currData) => {
           setIsModalOpen(true)
   
           const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
           const url = `${BACK_HOST}api/v1/admin/updateDataOfPreparedJam/${id}`;
           setUrl(url);
   
           const currentData = {
               jamId: currData.jamId,
               jamQty: currData.jamQty,
               lcId: currData.lcId,
               lcQty: currData.lcQty
           }

           setInputModuleData(currentData)
          
       }

    return (
        <>
        <UpdateData   moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchJamPreparationData} queryParams={queryParams}/>

        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block">
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
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remove</th>
                                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Update</th>
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
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index+1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamQty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.lcQty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                    <div>{FormatTime(currData.jamPreparationTime)} </div>
                                                    {currData?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currData?.updatedAt)})</span>}
                                                    
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.jamPreparedBy}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                    <button type="button" onClick={() => { deleteData(currData._id) }}  className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none">
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

export default AdminDataOfJamPreparation;
