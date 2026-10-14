import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOvens, fetchToDeleteOven } from '../../../reduxStore/OvenIn/OvenSlice';
import OvenTopBar from './OvenTopBar';
import ModelAddNewOven from './ModelAddNewOven';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminOven = () => {

  const state = useSelector((state) => state.ovenReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // console.log("state12", state.data.oven);
  useEffect(() => {
    dispatch(fetchAllOvens());
  }, [dispatch]);

  useEffect(() => {
    if (state && Array.isArray(state?.data?.oven)) {
      setGetAllDataFromCollection(state.data.oven);
    } else {
      setGetAllDataFromCollection([]); // Default to an empty array if data is not an array
    }
  }, [state]);
  // console.log("getAllDataFromCollection",getAllDataFromCollection);

  const deleteData = async (id, ovenData) => {
    if (window.confirm("Do you really want to delete?") && ovenData.status === 'empty') {
      dispatch(fetchToDeleteOven(id)).then(() => {
        dispatch(fetchAllOvens());
      });
    }else{
      toast.success(`Can't delete!! Oven currently not empty`);
    }
  }

  function navigateToOven(ovenData) {
    if (ovenData.status === 'empty') {
      toast.success(`Oven currently empty`);
    } else {
      navigate('/admin/ovenStatus', { state: { ovenData: ovenData } })
    }
  }

  const searchOven = (Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).filter((currHum) => currHum?.serialNo?.includes(searchQuery));

  return (
    <>
      <OvenTopBar />
      <ModelAddNewOven />
      <div className="relative overflow-x-auto shadow-md rounded-lg mx-4 mt-2 mb-2">
        <div className="flex items-center justify-between w-full flex-column flex-wrap md:flex-row pb-4 bg-white dark:bg-teal-900">
          <div className="mx-6 my-2 text-white">
            <div className="text-xl font-bold">Oven</div>
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
                {/* <th scope="col" className="px-6 py-3">Status</th> */}
                <th scope="col" className="px-6 py-3">Remove</th>
              </tr>
            </thead>

            <tbody>
              {searchOven.map((currItem, currInd) => (
                <tr
                  className="bg-white border-b border-teal-200 dark:bg-white-800 dark:border-white-700 hover:bg-teal-100 dark:hover:bg-teal-100 hover:cursor-pointer"
                  key={currItem._id}
                  onClick={() => navigateToOven(currItem)}
                >
                  <td className="px-6 py-4">{currInd + 1}.</td>
                  <th scope="row" className="py-4 px-6 text-gray-900 whitespace-nowrap dark:text-black">
                    <div className="text-base font-semibold">{currItem?.serialNo}</div>
                  </th>
                  {/* <td className="px-6 py-4">
                    <div className="flex items-center">
                      {currItem?.status === "empty" ? "Empty" :" "}
                      {currItem?.status === "notFullyFilled" ? "Filling...." :" "}
                      {currItem?.status === "filledCompletely" ? `Filled Completely ` :" "}
                      {currItem?.status === "removing" ? "Removing..." :" "}
                      {currItem?.status === "maintenance" ? "Maintenance":""}
                    </div>
                  </td> */}
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteData(currItem._id, currItem);
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

export default AdminOven;





