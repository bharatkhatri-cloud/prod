import React, { useState } from "react";
import { toast } from "react-toastify";
import CollectionIdsInput from "../../components/CollectionIdsInput";
import useUpdateData from "../../hooks/useUpdateData";
import Loading from "../../assets/Loading";

const RejectNewMould = () => {
  const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
  const url = `${BACK_HOST}api/v1/rejectMould`
  const { updateData, loading } = useUpdateData(url);
  const [mouldData, setMouldData] = useState({
    mouldRejectionReason: "",
    mouldId: [],
    remarks: "",
  });

  //!Start : CollectionIdsInput Colect List of Id 
  const [listOfIds, setListOfIds] = useState([]);
  //!End : CollectionIdsInput collect List of Id 

  const handleInputData = (key, value) => {
    setMouldData({ ...mouldData, [key]: value });
  };

  const submitMouldData = async (e) => {
    e.preventDefault();
  
    const submissionData = {
      mouldId: [...listOfIds],
      mouldRejectionReason:
        mouldData.mouldRejectionReason === "Other"
          ? `Other: ${mouldData.remarks}`
          : mouldData.mouldRejectionReason,
    };
  
    const response = await updateData(submissionData);
  
    if (!response.success) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
    setListOfIds([])
    setMouldData({
      mouldRejectionReason: "",
      mouldId: [],
      remarks: "",
    })
  };
  

  const clearAll = () => {
    setMouldData({
      mouldId: "",
      mouldRejectionReason: "",
    });
  };

  return (
    <div
      className="max-w-sm bg-white-50 p-4 sm:mx-auto mx-4 my-4 rounded-lg shadow-lg justify-center"
    >
      <label
        htmlFor="mouldRejectionReason"
        className="block mt-2 text-sm font-medium text-teal-900"
      >
        Reason of Rejection:
      </label>
      <select
        id="mouldRejectionReason"
        value={mouldData.mouldRejectionReason}
        name="mouldRejectionReason"
        onChange={(e) => handleInputData(e.target.name, e.target.value)}
        className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
        required
      >
        <option value="">Select Reason...</option>
        <option value="Mold Break during Demolding">
          Mold Break during Demolding
        </option>
        <option value="Green Mold">Green Mold</option>
        <option value="Red Mold">Red Mold</option>
        <option value="Black Mold">Black Mold</option>
        <option value="No growth">No growth</option>
        <option value="Patchy Growth">Patchy Growth</option>
        <option value="Partial Growth">Partial Growth</option>
        <option value="Other">Other</option>
      </select>

      {mouldData.mouldRejectionReason === "Other" && (
        <>
          <label
            htmlFor="remarks"
            className="block mt-2 text-sm font-medium text-teal-900"
          >
            Remarks for other
          </label>
          <input
            type="text"
            id="remarks"
            value={mouldData.remarks}
            name="remarks"
            onChange={(e) => handleInputData("remarks", e.target.value)}
            className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
            placeholder="Pink Mold"
            required
          />
        </>
      )}

      <CollectionIdsInput moduleIdName="Mould Id" placeHolder={"M02202"} idPrefix="M" idLength={7} listOfIds={listOfIds} setListOfIds={setListOfIds}/>

      <div className="py-4 flex p-2">
        <button
          onClick={submitMouldData}
          className="mr-2 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          disabled={loading}
        >
          {loading ? (<Loading />) : ("Submit")}
        </button>

        <button
          type="button"
          onClick={() => clearAll()}
          className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default RejectNewMould;
