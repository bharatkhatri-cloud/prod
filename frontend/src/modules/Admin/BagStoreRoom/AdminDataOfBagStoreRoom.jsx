import { useDispatch, useSelector } from "react-redux";
import { fetchBagIncubationData, fetchToDeleteBagIncubationData } from '../../../reduxStore/Incubation/IncubationSlice';
import { useEffect, useState } from 'react';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import UpdateData from "../../../assets/UpdateData";

function AdminDataOfBagStoreRoom({ queryParams }) {
  const state = useSelector((state) => state.bagIncubationReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

  useEffect(() => {
    dispatch(fetchBagIncubationData());
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.dataOfRejectedBag) {
      setGetAllDataFromCollection(state.data.dataOfRejectedBag);
    }
  }, [state]);

  const deleteData = (id) => {
    if (window.confirm("Do you really want to delete?")) {

      dispatch(fetchToDeleteBagIncubationData(id)).then(() => {
        dispatch(fetchBagIncubationData(queryParams));
      });
    }
  }

  //? Update data thing 
  const [url, setUrl] = useState()
  const [moduleData, setModuleData] = useState({
    "bagId": "Bag ID",
    "reasonOfRejection": "Reason of Rejection",

  })
  const [inputModuleData, setInputModuleData] = useState({
    bagId: "",
    reasonOfRejection: "",

  })
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateData = (id, currData) => {
    setIsModalOpen(true)

    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
    const url = `${BACK_HOST}api/v1/admin/updateBagIncubationData/${id}`;
    setUrl(url);

    const currentData = {
      bagId: currData.bagId,
      reasonOfRejection: currData.reasonOfRejection,
    }

    setInputModuleData(currentData)

  }




  return (
    <>


      <UpdateData moduleData={moduleData} url={url} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} inputModuleData={inputModuleData} setInputModuleData={setInputModuleData} getDataAfterUpdate={fetchBagIncubationData} queryParams={queryParams} />

      <div className="flex flex-col">
        <div className=" overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block ">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Bag Id</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">REASON</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Bag Rejected By</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">REJECTION DATE</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">Bag Qty.(in gm)</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">LC ID</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">LC Qty.(ml)</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Bag Placing Date(Bag incubation)</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Remove</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Update</th>

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

                  {getAllDataFromCollection.map((currItem, index) => (
                    <tr className='hover:bg-teal-300' key={currItem._id}>

                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.bagId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.reasonOfRejection}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.bagRejectedBy}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.bagRejectionTime)}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                          <div>{FormatTime(currItem.bagRejectionTime)} </div>
                          {currItem?.updatedAt && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">edited ({FormatTime(currItem?.updatedAt)})</span>}

                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.bagQty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.JamOrLcId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.previousStatusTillBagInoculation?.JamOrLcQty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currItem.previousStatusTillBagInoculation?.inoculationTimeStamp)}</td>


                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none" onClick={() => { deleteData(currItem._id) }} >
                            Remove
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-green-600 hover:text-green-800 disabled:opacity-50 disabled:pointer-events-none" onClick={() => { updateData(currItem._id, currItem) }} >Edit</button>
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
}

export default AdminDataOfBagStoreRoom;
