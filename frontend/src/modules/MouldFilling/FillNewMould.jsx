import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToCreateNewMouldFilling } from '../../reduxStore/MouldFilling/MouldFillingSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MOULD_ID_LENGTH, MOULD_ID_SUFFIX } from '../../constant';

const CreateMouldFilling = () => {
    const dispatch = useDispatch();
    const [mouldFillingData, setMouldFillingData] = useState({
        bagId: "",
        filledBy: "",
        typeOfMould: "",
        mould: []
    });
    
    const [currentMouldId, setCurrentMouldId] = useState('');
    const mouldInputRef = useRef();


    const handleInputDataOfMouldFilling = (key, value) => {
        setMouldFillingData({ ...mouldFillingData, [key]: value });
    };

    const addMouldId = (id) => {
        const trimmedId = id.trim();
        if (!trimmedId) return;

        // Validation based on constants
        if (trimmedId.length !== MOULD_ID_LENGTH) {
            toast.error(`Mould ID must be ${MOULD_ID_LENGTH} characters long`);
            return;
        }
        if (!trimmedId.startsWith(MOULD_ID_SUFFIX)) {
            toast.error(`Mould ID must start with ${MOULD_ID_SUFFIX}`);
            return;
        }

        // Check for duplicates
        const isDuplicate = mouldFillingData.mould.some(item => item.mouldId === trimmedId);
        if (isDuplicate) {
            toast.error(`Mould ID ${trimmedId} is already added`);
            setCurrentMouldId('');
            return;
        }

        setMouldFillingData(prev => ({
            ...prev,
            mould: [...prev.mould, { mouldId: trimmedId }]
        }));
        setCurrentMouldId('');
        mouldInputRef.current.focus();
    };

    const handleMouldIdInput = (e) => {
        const value = e.target.value;
        setCurrentMouldId(value);

        // Auto-add if it matches criteria
        if (value.length >= MOULD_ID_LENGTH) {
             addMouldId(value);
        }
    };

    const removeMouldId = (indexToRemove) => {
        setMouldFillingData(prev => ({
            ...prev,
            mould: prev.mould.filter((_, index) => index !== indexToRemove)
        }));
    };


    const submitFilledMouldFillingData = async (e) => {
        // e.preventDefault(); // Optional, depending on if it's in a form submit
        
        if (mouldFillingData.mould.length === 0) {
            toast.error("Please add at least one Mould ID");
            return;
        }

        try {
            const res = await dispatch(fetchToCreateNewMouldFilling(mouldFillingData)).unwrap();
            if (res.success) {
                clearAll();
                toast.success("Mould filling data submitted successfully!");
            }

        } catch (error) {
            console.error(error);
            // toast.error("Failed to submit data"); // The slice might already handle this
        }
    };


    const clearAll = () => {
        setMouldFillingData({
            bagId: "",
            filledBy: "",
            typeOfMould: "",
            mould: []
        });
        setCurrentMouldId('');
    };

    const preventEnterKeySubmit = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (currentMouldId) {
                addMouldId(currentMouldId);
            }
        }
    };


    return (
        <div className="max-w-md bg-white-50 p-4 sm:mx-auto mx-4 my-6 rounded-xl shadow-lg border border-gray-100">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Mould Filling</h2>

            {/* Bag ID */}
            <div className="mb-4">
                <label htmlFor="bagId" className="block text-sm font-medium text-teal-900 mb-1">
                    Scan Bag ID
                </label>
                <input
                    type="text" id="bagId" value={mouldFillingData.bagId} name="bagId"
                    onChange={(e) => handleInputDataOfMouldFilling(e.target.name, e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Input Bag ID"
                    required
                />
            </div>

            {/* Filled By */}
             <div className="mb-4">
                <label htmlFor="filledBy" className="block text-sm font-medium text-teal-900 mb-1">
                    Filled By
                </label>
                <input
                    type="text" id="filledBy" value={mouldFillingData.filledBy} name="filledBy"
                    onChange={(e) => handleInputDataOfMouldFilling(e.target.name, e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Input Filled By"
                    required
                />
            </div>

            {/* Type of Mould */}
            <div className="mb-6">
                <label htmlFor="typeOfMould" className="block text-sm font-medium text-teal-900 mb-1">
                    Type of Mould
                </label>
                <input
                    type="text"
                    id="typeOfMould"
                    value={mouldFillingData.typeOfMould}
                    name="typeOfMould"
                    onChange={(e) => handleInputDataOfMouldFilling(e.target.name, e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Input Type of Mould"
                    required
                />
            </div>

            {/* Mould ID Input Section */}
             <div className="mb-4">
                <label className="block text-sm font-medium text-teal-900 mb-2">
                    Scan Mould ID
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        ref={mouldInputRef}
                        value={currentMouldId}
                        onChange={handleMouldIdInput}
                        onKeyDown={preventEnterKeySubmit}
                        placeholder={`Scan ID (e.g. ${MOULD_ID_SUFFIX}...)`}
                         className="block w-full p-2.5 bg-gray-50 border border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                        type="button"
                        onClick={() => addMouldId(currentMouldId)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Scanned List */}
            {mouldFillingData.mould.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Scanned Moulds ({mouldFillingData.mould.length})
                        </span>
                        <button 
                            type="button"
                            onClick={() => setMouldFillingData(prev => ({...prev, mould: []}))}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Clear List
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {mouldFillingData.mould.map((item, index) => (
                            <div key={index} className="inline-flex items-center bg-white border border-gray-200 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-full shadow-sm">
                                {item.mouldId}
                                <button
                                    type="button"
                                    onClick={() => removeMouldId(index)}
                                    className="ml-2 text-gray-400 hover:text-red-500 rounded-full p-0.5 hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={submitFilledMouldFillingData}
                    className="flex-1 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                >
                    Submit
                </button>

                <button
                    type="button"
                    onClick={clearAll}
                     className="flex-1 text-red-700 bg-white border border-red-700 hover:bg-red-50 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default CreateMouldFilling;
