import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllHumidifiers, deleteHumidifier, updateChamberStatus } from '../../../reduxStore/Humidifier/HumidifierSlice';
import HumidifierTopBar from './HumidifierTopBar';
import ModelAddNewHumidifier from './ModelAddNewHumidifier';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminHumidifier = () => {

  const state = useSelector((state) => state.growthChamberReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateChamberStatus({ id, status: newStatus })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchAllHumidifiers());
      }
    });
  };

  useEffect(() => {
    dispatch(fetchAllHumidifiers());
  }, [dispatch]);

  useEffect(() => {
    if (state && Array.isArray(state.data)) {
      setGetAllDataFromCollection(state.data);
    } else {
      setGetAllDataFromCollection([]); // Default to an empty array if data is not an array
    }
  }, [state]);

  const deleteData = async (id, humData) => {
    if (window.confirm("Do you really want to delete?") && humData.status === 'empty') {
      dispatch(deleteHumidifier(id)).then(() => {
        dispatch(fetchAllHumidifiers());
      });
    }else{
      toast.success(`Can't delete!! Humidifier currently not empty`);
    }
  }

  function navigateToHumidifier(humData) {
    if (humData.status === 'empty') {
      toast.success(`Humidifier currently empty`);
    } else {
      navigate('/admin/humidifierStatus', { state: { humidifier: humData } })
    }
  }

  const searchHumidifier = (Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).filter((currHum) => currHum?.serialNo?.includes(searchQuery));

  return (
    <>
      <HumidifierTopBar />
      <ModelAddNewHumidifier />
      <div className="relative overflow-x-auto shadow-md rounded-lg mx-4 mt-2 mb-2">
        <div className="flex items-center justify-between w-full flex-column flex-wrap md:flex-row pb-4 bg-white dark:bg-teal-900">
          <div className="mx-6 my-2 text-white">
            <div className="text-xl font-bold">Humidifiers</div>
          </div>
          <div className="relative mx-6 my-2 p-1 flex justify-end">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="table-search-users"
              className="block p-2 ps-10 text-sm text-teal-900 border border-teal-300 rounded-lg w-80 bg-teal-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-teal-700 dark:border-teal-600 dark:placeholder-teal-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search Humidifier"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-black-500 dark:text-black-400">
            <thead className="text-xs text-gray-700 uppercase bg-teal-50 dark:bg-teal-700 dark:text-white">
              <tr>
                <th scope="col" className="px-6 py-3">S.No.</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Department</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Cycle Count</th>
                <th scope="col" className="px-6 py-3">Remove</th>
              </tr>
            </thead>

            <tbody>
              {searchHumidifier.map((currItem, currInd) => (
                <tr
                  className="bg-white border-b border-teal-200 dark:bg-white-800 dark:border-white-700 hover:bg-teal-100 dark:hover:bg-teal-100 hover:cursor-pointer"
                  key={currItem.id || currItem._id}
                  onClick={() => navigateToHumidifier(currItem)}
                >
                  <td className="px-6 py-4">{currInd + 1}.</td>
                  <th scope="row" className="py-4 px-6 text-gray-900 whitespace-nowrap dark:text-black">
                    <div className="text-base font-semibold">{currItem?.serialNo}</div>
                  </th>
                  <td className="px-6 py-4">{currItem?.type}</td>
                  <td className="px-6 py-4">
                    {currItem?.department === "MF" ? "Mould Filling" : ""}
                    {currItem?.department === "SMFG" ? "Humidifier" : ""}
                    {!currItem?.department ? "N/A" : ""}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      {["empty", "clean", "maintenance"].includes(currItem?.status) && (!currItem?.activeBatches || currItem?.activeBatches.length === 0) ? (
                        <select
                          value={currItem?.status}
                          onChange={(e) => handleStatusChange(currItem.id || currItem._id, e.target.value)}
                          className="bg-white border border-teal-300 rounded text-sm px-2 py-1 text-teal-900 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        >
                          <option value="empty">Empty</option>
                          <option value="clean">Clean</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      ) : (
                        <>
                          {currItem?.status === "empty" ? "Empty" :" "}
                          {currItem?.status === "notFullyFilled" ? "Filling...." :" "}
                          {currItem?.status === "filledCompletely" ? `Filled Completely ` :" "}
                          {currItem?.status === "readingCollected" ? "Reading Collected" :" "}
                          {currItem?.status === "clean" ? "Clean" :" "}
                          {currItem?.status === "maintenance" ? "Maintenance" : " "}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{currItem?.cycleCount % 6}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteData(currItem.id || currItem._id, currItem);
                      }}
                      className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminHumidifier;





