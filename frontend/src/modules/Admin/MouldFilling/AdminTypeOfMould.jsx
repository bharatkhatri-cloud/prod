import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import { fetchToGetTypeOfMould, fetchToDeleteTypeOfMould } from '../../../reduxStore/MouldFilling/TypeOfMouldSlice';
import AdminAddNewTypeOfMould from './AdminAddNewTypeOfMould';
import MouldTopBar from './MouldTopBar';

const AdminTypeOfMould = () => {

  const state = useSelector((state) => state.TypeOfMouldReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

  useEffect(() => {
    dispatch(fetchToGetTypeOfMould());
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.typeOfMouldData) {
      setGetAllDataFromCollection(state.data.typeOfMouldData);
    }
  }, [state]);

  const deleteData = async (id) => {
    if (window.confirm("Do you really want to delete?")) {
      dispatch(fetchToDeleteTypeOfMould(id)).then(() => {
        dispatch(fetchToGetTypeOfMould());
      });
    }
  }


  return (
    <>
    <MouldTopBar/>
   

      <ol className="max-w-md divide-y divide-gray-200 dark:divide-gray-700 mx-4 mt-4 mb-1 border rounded-lg p-5">
        {state.isLoading &&
          <div>
            <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
              <Loader />
            </div>
          </div>
        }
        {getAllDataFromCollection.map((currItem, currIndex) => (
          <li key={currItem._id} className="pb-3 sm:pb-4 rounded-b-lg hover:bg-gray-200 p-2">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <h6 className="text-md font-bold dark:text-black">{currIndex + 1}.</h6>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-black">
                  {currItem.typeOfMould}
                </p>
              </div>
              <div className="p-2 inline-flex items-center text-base font-semibold text-gray-900 dark:text-black">
                <button
                  className="text-red-700 hover:text-red-900"
                  onClick={() => deleteData(currItem._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* <ol className="max-w-md divide-y divide-gray-200 dark:divide-gray-700 mx-4">
        <button
          type="button"
          className="text-black-700 hover:text-black border border-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-teal-500 dark:text-black-500 dark:hover:text-black dark:hover:bg-teal-600 dark:focus:ring-teal-800"
          onClick={handleAddNewType}
        >
          Add New Type Of Mould
        </button>
      </ol> */}
      <AdminAddNewTypeOfMould />
    </>
  );
};




export default AdminTypeOfMould
