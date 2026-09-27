import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBagInoculationData, fetchDeletingBagInoculationData } from '../../../reduxStore/BagInoculation/BagInoculationSlice';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import UpdateData from '../../../assets/UpdateData';

const AdminDataOfBagInoculation = ({ queryParams }) => {
  const state = useSelector((state) => state.bagInoculationReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

  useEffect(() => {
    dispatch(fetchBagInoculationData());
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.dataOfBagInoculation) {
      setGetAllDataFromCollection(state.data.dataOfBagInoculation);
    }
  }, [state]);


  const deleteData = (id) => {
    if (window.confirm("Do you really want to delete?")) {
      dispatch(fetchDeletingBagInoculationData(id))
        .then(() => {
          dispatch(fetchBagInoculationData(queryParams));
        })
        .catch(error => {
          console.error("Error deleting data:", error);
        });
    }
  };

  //? Update data thing 
  const [url, setUrl] = useState()
  const [moduleData, setModuleData] = useState({
    "bagId": "Bag ID",
    "bagQty": "Bag Quantity(in ml)",
    "JamOrLcId": "Jam/LC ID",
    "JamOrLcQty": "Jam/LC Quantity(in ml.)",
  })
  const [inputModuleData, setInputModuleData] = useState({
    bagId: "",
    bagQty: "",
    JamOrLcId: "",
    JamOrLcQty: ""
  })
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateData = (id, currData) => {
    setIsModalOpen(true)

    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
    const url = `${BACK_HOST}api/v1/admin/updateBagInoculatedData/${id}`;
    setUrl(url);

    const currentData = {
      bagId: currData.bagId,
      bagQty: currData.bagQty,
      JamOrLcId: currData.JamOrLcId,
      JamOrLcQty: currData.JamOrLcQty
    }

    setInputModuleData(currentData)

  }


  return (
    <>
      <UpdateData moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchBagInoculationData} queryParams={queryParams} />
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag ID</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag Quantity</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam/LC ID</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Jam/LC Quantity</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Inoculated By</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Inoculation Time </th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Remove</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  
                  {getAllDataFromCollection.map((currItem, index) => (
                    <tr className="hover:bg-teal-300" key={currItem._id}>


                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.bagId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.bagQty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.JamOrLcId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.JamOrLcQty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.inoculatedBy}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.inoculationTimeStamp)}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                              <div>{FormatTime(currItem.inoculationTimeStamp)} </div>
                              {currItem?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currItem?.updatedAt)})</span>}
                                                    
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none" onClick={() => { deleteData(currItem._id) }} >
                            Remove
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-green-600 hover:text-green-800 disabled:opacity-50 disabled:pointer-events-none" onClick={() => { updateData(currItem._id,currItem) }} >
                            Edit
                          </button>
                        </td>
                      </>

                    </tr>
                  ))}
                  {state.isLoading && (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                        <Loader />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDataOfBagInoculation;
