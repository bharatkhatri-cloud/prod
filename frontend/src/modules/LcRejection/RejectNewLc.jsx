import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToRejectNewLcBottle } from '../../reduxStore/LcRejection/LcRejectionSlice';
import QRScanner from '../../assets/QRScanner';

const RejectLc = () => {
  const dispatch = useDispatch();
  const [lcRejectionData, setLcRejectionData] = useState({
    lcId: "",
    reasonOfRejection: "",
    remarks: "",
  });

  const handleInputDataOfLcRejection = (key, value) => {
    setLcRejectionData(prevState => ({ ...prevState, [key]: value }));
  };

  const submitFilledLcRejectionData = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      lcId: lcRejectionData.lcId,
      reasonOfRejection: lcRejectionData.reasonOfRejection === "Other"
        ? `Other: ${lcRejectionData.remarks}`
        : lcRejectionData.reasonOfRejection,
    };

    try {
      const response = await dispatch(fetchToRejectNewLcBottle(submissionData)).unwrap();
      if (response.success) {
        setLcRejectionData({
          lcId: "",
          reasonOfRejection: "",
          remarks: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const lcIDResult = (result) => {
    setLcRejectionData(prevState => ({ ...prevState, lcId: result }));
  };

  const clearAll = () => {
    setLcRejectionData({
      lcId: "",
      reasonOfRejection: "",
      remarks: "",
    });
  };

  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    if (window.confirm("Do you really want to On/Off?")) {
      setChecked(!checked);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20 py-8 px-4 sm:px-6">
      <form 
        onSubmit={submitFilledLcRejectionData} 
        className="max-w-md mx-auto p-6 bg-white border border-gray-100 rounded-2xl shadow-md space-y-4"
      >
        {/* Form Header */}
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">LC Rejection</h2>
          <p className="text-[11px] text-gray-400 font-medium">Record rejected Liquid Culture bottle details.</p>
        </div>

        {/* Toggle Scanner Switch */}
        <div className="py-1">
          <label className="inline-flex items-center gap-3 cursor-pointer p-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={handleToggle}
            />
            <div className="relative w-10 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-black"></div>
            <span className="text-xs font-bold text-gray-700">
              {checked ? "Disable Scanner" : "Enable Scanner"}
            </span>
          </label>
        </div>

        {/* Scan/Input LC ID */}
        <div className="space-y-1">
          <label htmlFor="lcId" className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400">
            LC ID
          </label>
          
          {checked && (
            <div className="pb-2">
              <QRScanner hidden={checked} idName={"lcIdScanner"} buttonName={"Scan LC ID"} resultOnScanSuccess={lcIDResult} />
            </div>
          )}

          <input
            type="text"
            id="lcId"
            value={lcRejectionData.lcId}
            name="lcId"
            onChange={(e) => handleInputDataOfLcRejection('lcId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
            placeholder="Input LC ID"
            required
          />
        </div>

        {/* Rejection Reason Dropdown */}
        <div className="space-y-1">
          <label htmlFor="reasonOfRejection" className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400">
            Reason of Rejection
          </label>
          <select
            id="reasonOfRejection"
            value={lcRejectionData.reasonOfRejection}
            name="reasonOfRejection"
            onChange={(e) => handleInputDataOfLcRejection('reasonOfRejection', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150 cursor-pointer"
            required
          >
            <option value="">Select Reason...</option>
            <option value="Turbidity">Turbidity</option>
            <option value="Green Mold">Green Mold</option>
            <option value="No growth">No growth</option>
            <option value="Orange Mold">Orange Mold</option>
            <option value="Black Mold">Black Mold</option>
            <option value="Media leak from bottle">Media leak from bottle</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Remarks for Other */}
        {lcRejectionData.reasonOfRejection === "Other" && (
          <div className="space-y-1">
            <label htmlFor="remarks" className="block text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400">
              Remarks for Other
            </label>
            <input
              type="text"
              id="remarks"
              value={lcRejectionData.remarks}
              name="remarks"
              onChange={(e) => handleInputDataOfLcRejection('remarks', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
              placeholder="e.g. Pink Mold"
              required
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={clearAll}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="ml-3 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150 shadow-md shadow-black/10"
          >
            Submit Rejection
          </button>
        </div>
      </form>
    </div>
  );
};

export default RejectLc;
