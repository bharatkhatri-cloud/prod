
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useEffectSkipInitial from '../hooks/useEffectSkipInitial';

const FilterByDate = ({ extraFilters, getData , queryParams ,setQueryParams}) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerEffect, setTriggerEffect] = useState(false); 


  const [filterParams, setFilterParams] = useState({});
  const dateFilters = {
    "onDate": "",
    "startDate": "",
    "endDate": ""
  };
  const emptyExtraFilters = Object.fromEntries(Object.keys(extraFilters).map((key)=>[key, ""])) //Ex: Object.fromEntries(["lcId", ""], ["lcQty", ""])
  useEffect(() => {
    setFilterParams({ ...dateFilters, ...emptyExtraFilters });
  }, []);

  const handleFilterParams = (key, value) => {
    setFilterParams({
      ...filterParams, [key]: value
    });
    setQueryParams((prev) => ({ ...prev, [key]: value }));
  };

  const submitFilterQuery = () => {
    const filteredQueryParams = Object.entries(filterParams).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});
    setQueryParams({...queryParams,...filteredQueryParams})
    setTriggerEffect(!triggerEffect); //?this is use for the preventing the unnecessary call of useEffect
  };

  useEffectSkipInitial(() => {
    dispatch(getData(queryParams)); //! one
  }, [triggerEffect]);
 

  const clearAllQueryParams = () => {
    const clearAllFilters = Object.fromEntries(Object.keys(filterParams).map((key,_) => [key, ""]));
    setFilterParams(clearAllFilters);
    dispatch(getData());
    setQueryParams({page:1})
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      {/* Modal toggle button */}
      <button
        onClick={toggleModal}
        type="button"
        className="bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
      >
        Filters
      </button>

      {/* Main modal */}
      {isModalOpen && (
        <div
          id="authentication-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-screen bg-black bg-opacity-50 overflow-y-auto"
          >
          <div className="relative p-4 w-full max-w-md  max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-black ">
                  Filters
                </h3>
                <button
                  type="button"
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={toggleModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-4 md:p-5">
                <div className="space-y-2">
                  {Object.keys(extraFilters).map((key) => (
                    <div key={key}>
                      <label className="block text-gray-700 text-sm font-medium">{extraFilters[key]}</label>
                      <input
                        value={filterParams[key]}
                        onChange={(e) => handleFilterParams(key, e.target.value)}
                        className="border border-teal-300 rounded-md p-1.5 w-full "
                      />
                    </div>
                  ))}
                  <div>
                    <label className={`block text-gray-700 text-sm font-medium ${filterParams.startDate || filterParams.endDate ? 'opacity-40' : ''}`}>On Date</label>
                    <input
                      type='Date'
                      value={filterParams.onDate}
                      onChange={(e) => handleFilterParams("onDate", e.target.value)}
                      className={`border border-teal-300 rounded-md p-1.5 w-full ${filterParams.startDate || filterParams.endDate ? 'opacity-40 w-full' : ''}`}
                      disabled={!!filterParams.startDate || !!filterParams.endDate}
                    />
                  </div>
                  <div>
                    <label className={`block text-gray-700 text-sm font-medium ${filterParams.onDate ? 'opacity-40' : ''}`}>Start Date</label>
                    <input
                      type='Date'
                      value={filterParams.startDate}
                      onChange={(e) => handleFilterParams("startDate", e.target.value)}
                      className={`border border-teal-300 rounded-md p-1.5 w-full ${filterParams.onDate ? 'opacity-40 w-full' : ''}`}
                      disabled={!!filterParams.onDate}
                    />
                  </div>
                  <div>
                    <label className={`block text-gray-700 text-sm font-medium ${filterParams.onDate ? 'opacity-40' : ''}`}>End Date</label>
                    <input
                      type='Date'
                      value={filterParams.endDate}
                      onChange={(e) => handleFilterParams("endDate", e.target.value)}
                      className={`border border-teal-300 rounded-md p-1.5 w-full ${filterParams.onDate ? 'opacity-40 w-full' : ''}`}
                      disabled={!!filterParams.onDate}
                    />
                  </div>
                </div>

                <div className='flex justify-between mt-4'>
                  <button
                    onClick={() => clearAllQueryParams()}
                    className="text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:focus:ring-yellow-900"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => submitFilterQuery()}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterByDate;
