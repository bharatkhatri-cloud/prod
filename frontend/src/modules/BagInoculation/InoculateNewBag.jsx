import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToInoculateNewBag } from '../../reduxStore/BagInoculation/BagInoculationSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BAG_ID_LENGTH, BAG_ID_SUFFIX } from '../../constant';

const InoculateNewBag = () => {
    const dispatch = useDispatch();
    const [bagInoculationData, setBagInoculationData] = useState({
        JamOrLcId: '',
        JamOrLcQty: '',
        bagId: [],
        bagQty: '',
        remark:''
    });
    
    const [currentBagId, setCurrentBagId] = useState('');
    const bagInputRef = useRef();

    const handleInputDataOfBagInoculation = (key, value) => {
        setBagInoculationData(prevData => ({
            ...prevData,
            [key]: value
        }));
    };

    const addBagId = (id) => {
        const trimmedId = id.trim();
        if (!trimmedId) return;

        // Validation
        if (trimmedId.length !== BAG_ID_LENGTH) {
            toast.error(`Bag ID must be ${BAG_ID_LENGTH} characters long`);
            return;
        }
        if (!trimmedId.startsWith(BAG_ID_SUFFIX)) {
            toast.error(`Bag ID must start with ${BAG_ID_SUFFIX}`);
            return;
        }

        // Duplicate check
        if (bagInoculationData.bagId.includes(trimmedId)) {
            toast.error(`Bag ID ${trimmedId} is already added`);
            setCurrentBagId('');
            return;
        }

        setBagInoculationData(prev => ({
            ...prev,
            bagId: [...prev.bagId, trimmedId]
        }));
        setCurrentBagId('');
        bagInputRef.current.focus();
    };

    const handleBagIdInput = (e) => {
        const value = e.target.value;
        setCurrentBagId(value);
        
        // Auto-add if it matches criteria
        if (value.length >= BAG_ID_LENGTH) {
             addBagId(value);
        }
    };

    const removeBagId = (indexToRemove) => {
        setBagInoculationData(prev => ({
            ...prev,
            bagId: prev.bagId.filter((_, index) => index !== indexToRemove)
        }));
    };

    const submitFilledBagInoculationData = async e => {
        e.preventDefault();

        if (bagInoculationData.bagId.length === 0) {
            toast.error("Please add at least one Bag ID");
            return;
        }

        try {
            console.log("bagInoculationData",bagInoculationData)
            const response = await dispatch(fetchToInoculateNewBag({
                ...bagInoculationData,
                bagId: bagInoculationData.bagId // Just pass the array
            })).unwrap();
            
            if (response.success) {
                setBagInoculationData({
                    JamOrLcId: '',
                    JamOrLcQty: bagInoculationData.JamOrLcQty,
                    bagId: [],
                    bagQty: bagInoculationData.bagQty,
                    remark: ''
                });
                setCurrentBagId('');
            }
        } catch (error) {
            console.error('Error during submission:', error);
        }
    };

    const clearAll = () => {
        setBagInoculationData({
            JamOrLcId: '',
            JamOrLcQty: '',
            bagId: [],
            bagQty: '',
            remark: ''
        });
        setCurrentBagId('');
    };

    const preventEnterKeySubmit = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (currentBagId) {
                addBagId(currentBagId);
            }
        }
    };

    return (
        <form
            onSubmit={submitFilledBagInoculationData}
            className="max-w-md bg-white-50 p-4 sm:mx-auto mx-4 my-6 rounded-xl shadow-lg border border-gray-100"
        >
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Inoculate New Bag</h2>

            {/* Bag ID Input Section */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scan Bag ID
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        ref={bagInputRef}
                        value={currentBagId}
                        onChange={handleBagIdInput}
                        onKeyDown={preventEnterKeySubmit}
                        placeholder={`Scan ID (e.g. ${BAG_ID_SUFFIX}...)`}
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => addBagId(currentBagId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Scanned List */}
            {bagInoculationData.bagId.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Scanned Bags ({bagInoculationData.bagId.length})
                        </span>
                        <button 
                            type="button"
                            onClick={() => setBagInoculationData(prev => ({...prev, bagId: []}))}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Clear List
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {bagInoculationData.bagId.map((id, index) => (
                            <div key={index} className="inline-flex items-center bg-white border border-gray-200 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-full shadow-sm">
                                {id}
                                <button
                                    type="button"
                                    onClick={() => removeBagId(index)}
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

            {/* Bag Quantity */}
            <div className="mb-4">
                <label htmlFor="bagQty" className="block text-sm font-medium text-gray-700 mb-2">
                    Bag Quantity
                </label>
                <input
                    type="number"
                    id="bagQty"
                    value={bagInoculationData.bagQty}
                    onChange={e => handleInputDataOfBagInoculation('bagQty', e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Bag Quantity"
                    required
                    min={0}
                />
            </div>

            {/* JAM/LC ID */}
            <div className="mb-4">
                <label htmlFor="JamOrLcId" className="block text-sm font-medium text-gray-700 mb-2">
                    JAM/LC ID
                </label>
                <input
                    type="text"
                    id="JamOrLcId"
                    value={bagInoculationData.JamOrLcId}
                    onChange={e => handleInputDataOfBagInoculation('JamOrLcId', e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Jam/LC ID"
                    required
                />
            </div>

            {/* JAM/LC Quantity */}
            <div className="mb-6">
                <label htmlFor="JamOrLcQty" className="block text-sm font-medium text-gray-700 mb-2">
                    JAM/LC Quantity
                </label>
                <input
                    type="number"
                    id="JamOrLcQty"
                    value={bagInoculationData.JamOrLcQty}
                    onChange={e => handleInputDataOfBagInoculation('JamOrLcQty', e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Jam/LC Quantity"
                    required
                    min={0}
                />
            </div>

            {/* Remark */}
            <div className="mb-6">
                <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                </label>
                <input
                    type="text"
                    id="remark"
                    value={bagInoculationData.remark}
                    onChange={e => handleInputDataOfBagInoculation('remark', e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Remark"  
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                >
                    Submit
                </button>
                <button
                    type="button"
                    onClick={clearAll}
                    className="flex-1 text-red-600 bg-white border border-red-600 hover:bg-red-50 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                >
                    Clear All
                </button>
            </div>
        </form>
    );
};

export default InoculateNewBag;
