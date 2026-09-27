import React, { useState, createRef, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToPrepareNewLc } from '../../reduxStore/LcPreparation/LcPreparationSlice';
import QRScanner from '../../assets/QRScanner';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateNewLc = () => {
  const dispatch = useDispatch();
  const [lcPreparationData, setLcPreparationData] = useState({
    lcId: ["", "", "", "", "", "", "", "", "", ""],
    lcQty: "",
    scId: "",
    scQty: "",
  });

  const lcIdRefs = useRef([
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
    createRef(),
  ]);

  const handleInputDataOfLcId = (index, value) => {
    setLcPreparationData((prevData) => {
      const newLcId = [...prevData.lcId];
      newLcId[index] = value;
      return { ...prevData, lcId: newLcId };
    });
    lcIdRefs.current[index].current.focus();
  };

  const handleInputDataOfLcPreparation = (key, value) => {
    setLcPreparationData({ ...lcPreparationData, [key]: value });
  };

  const submitFilledLcPreparationData = async (e) => {
    e.preventDefault();

    const duplicatesLcIds = lcPreparationData.lcId.filter(
      (currLcId, index, lcIdArray) => lcIdArray.indexOf(currLcId) !== index && currLcId !== ""
    );
    const filterLcIdData = lcPreparationData.lcId.filter(
      (currLcId) => currLcId !== ""
    );

    let filterLcPreparationData = {
      lcId: filterLcIdData,
      lcQty: lcPreparationData.lcQty,
      scId: lcPreparationData.scId,
      scQty: lcPreparationData.scQty,
    };

    if (duplicatesLcIds.length > 0) {
      let alertMessage = `Duplicate LC ID found. Please remove duplicate LC ID(s): "${duplicatesLcIds.join(
        ", "
      )}"`;
      toast.error(alertMessage);
    } else {
      try {
        const response = await dispatch(
          fetchToPrepareNewLc(filterLcPreparationData)
        ).unwrap();
        console.log("response", response);
        if (response.success) {
          setLcPreparationData({
            lcId: ["", "", "", "", "", "", "", "", "", ""],
            lcQty: lcPreparationData.lcQty,
            scId: "",
            scQty: lcPreparationData.scQty,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const clearAll = () => {
    setLcPreparationData({
      lcId: ["", "", "", "", "", "", "", "", "", ""],
      lcQty: "",
      scId: "",
      scQty: "",
    });
  };

  const preventEnterKeySubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20 py-8 px-4 sm:px-6">
      <form
        onSubmit={submitFilledLcPreparationData}
        className="max-w-md mx-auto p-6 bg-white border border-gray-100 rounded-2xl shadow-md space-y-4"
      >
        {/* Form Header */}
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">LC Preparation</h2>
          <p className="text-[11px] text-gray-400 font-medium">Record Liquid Culture batch preparation details.</p>
        </div>

        {/* Input Fields Grid for LC IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {lcPreparationData.lcId.map((lcId, index) => (
            <div key={index} className="space-y-1">
              <label
                htmlFor={`lcId${index + 1}`}
                className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400"
              >
                LC ID {index + 1}
              </label>
              <input
                type="text"
                id={`lcId${index + 1}`}
                value={lcId}
                name={`lcId${index + 1}`}
                ref={lcIdRefs.current[index]}
                onChange={(e) => handleInputDataOfLcId(index, e.target.value)}
                onKeyDown={preventEnterKeySubmit}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
                placeholder={`Input LC ID ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Operational Quantities & SC Fields */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="lcQty"
                className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400"
              >
                LC Qty (ml)
              </label>
              <input
                type="number"
                id="lcQty"
                value={lcPreparationData.lcQty}
                name="lcQty"
                onChange={(e) =>
                  handleInputDataOfLcPreparation(e.target.name, e.target.value)
                }
                onKeyDown={preventEnterKeySubmit}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
                placeholder="LC Quantity"
                required
                min={0}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="scQty"
                className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400"
              >
                SC Qty (ml)
              </label>
              <input
                type="number"
                id="scQty"
                value={lcPreparationData.scQty}
                name="scQty"
                onChange={(e) =>
                  handleInputDataOfLcPreparation(e.target.name, e.target.value)
                }
                onKeyDown={preventEnterKeySubmit}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
                placeholder="SC Quantity"
                required
                min={0}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="scId"
              className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400"
            >
              SC ID
            </label>
            <input
              type="text"
              id="scId"
              value={lcPreparationData.scId}
              name="scId"
              onChange={(e) =>
                handleInputDataOfLcPreparation(e.target.name, e.target.value)
              }
              onKeyDown={preventEnterKeySubmit}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
              placeholder="Scan or Input SC ID"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => clearAll()}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="ml-3 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150 shadow-md shadow-black/10"
          >
            Submit Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewLc;
