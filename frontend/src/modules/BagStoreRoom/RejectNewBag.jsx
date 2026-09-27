import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToRejectNewBag } from '../../reduxStore/Incubation/IncubationSlice';
import QRScanner from '../../assets/QRScanner';

const RejectNewBag = () => {
  const dispatch = useDispatch();
  const [bagRejectionData, setBagRejectionData] = useState({
    bagId: "",
    reasonOfRejection: "",
    remarks: "",
  });

  const handleInputDataOfBagRejection = (key, value) => {
    setBagRejectionData({ ...bagRejectionData, [key]: value });
  };

  const submitFilledBagRejectionData = async (e) => {
    e.preventDefault();
    const submissionData = {
      bagId: bagRejectionData.bagId,
      reasonOfRejection: bagRejectionData.reasonOfRejection === "Other"
        ? `Other: ${bagRejectionData.remarks}`
        : bagRejectionData.reasonOfRejection,
    };
    try {
      const response = await dispatch(fetchToRejectNewBag(submissionData)).unwrap();      
      console.log("response", response);
      if ( response.success) {        
        setBagRejectionData({
          bagId: "",
          reasonOfRejection: "",
          remarks:""
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bagIDResult = (result) => {
    setBagRejectionData({ ...bagRejectionData, bagId: result });
  };

  const clearAll = async () => {
    setBagRejectionData({
      bagId: "",
      reasonOfRejection: "",
       remarks:""
    });
  };

  return (
    <>
      <form onSubmit={submitFilledBagRejectionData} className="max-w-sm bg-white-50 p-4 sm:mx-auto mx-4 my-4 rounded-lg shadow-lg justify-center">
        <label htmlFor="bagId" className="block mt-2 text-sm font-medium text-teal-900">
          Bag ID:
          <QRScanner idName={"bagIdScanner"} buttonName={"Scan Bag ID"} resultOnScanSuccess={bagIDResult} />
        </label>
        <input
          type="text" id="bagId" value={bagRejectionData.bagId} name="bagId"
          onChange={(e) => handleInputDataOfBagRejection(e.target.name, e.target.value)}
          className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
          placeholder="Input Bag ID"
          required
        />




        <label htmlFor="reasonOfRejection" className="block mt-2 text-sm font-medium text-teal-900">
          Reason of Rejection:
        </label>
        <select id="reasonOfRejection" value={bagRejectionData.reasonOfRejection} name="reasonOfRejection"
          onChange={(e) => handleInputDataOfBagRejection(e.target.name, e.target.value)}
          className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
          required
        >
          <option value="">Select Reason...</option>
          <option value="Green Mold">Green Mold</option>
          <option value="No growth">No growth</option>
          <option value="Orange Mold">Orange Mold</option>
          <option value="Black Mold">Black Mold</option>
          <option value="Bag Tear">Bag Tear</option>
          <option value="Patchy Growth/Partial growth">Patchy Growth/Partial growth</option>
          <option value="Other">Other</option>
        </select>

        {bagRejectionData.reasonOfRejection === "Other" && (
        <>
          <label htmlFor="remarks" className="block mt-2 text-sm font-medium text-teal-900">
            Remarks for other
          </label>
          <input
            type="text"
            id="remarks"
            value={bagRejectionData.remarks}
            name="remarks"
            onChange={(e) => handleInputDataOfBagRejection('remarks', e.target.value)}
            className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
            placeholder="Pink Mold"
            required
          />
        </>
      )}


        <div className='py-4'>
          <button
            type="submit"
            className="mr-2 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={() => clearAll()}
            className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Clear All
          </button>
        </div>
      </form>
    </>
  );
};

export default RejectNewBag;
