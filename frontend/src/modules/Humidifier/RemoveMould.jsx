import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getAddedMouldsData } from '../../reduxStore/Humidifier/HumidifierSlice'
import { fetchHumidifiers } from '../../reduxStore/GrowthChamber/HumidifierSlice';
import ReadingsData from './ReadingsData';
import DataInHumidifier from './DataInHumidifier';

const RemoveMould = () => {
    const state = useSelector((state) => state.growthChamberReducer)
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [humidifier] = useState(location.state.humidifier);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [addedMouldData, setAddedMouldsData] = useState({});
    const [growthType, setgrowthType] = useState();
    const [activeTab, setActiveTab] = useState('readings');

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (selectedFiles.length + files.length > 5) {
            toast.warning("You can only upload a maximum of 5 images.");
            return;
        }
        // Append new files to existing ones
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
        
        // Reset the input value so the same file can be selected again if needed
        event.target.value = ""; 
    };

    const removeImage = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        dispatch(getAddedMouldsData({ humidifier }));
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.data) {
            setAddedMouldsData(state.data.data);
        }
    }, [state]);



    const uploadImagesAndGrowthType = async () => {
        // Create a new FormData object

        // Append each file to the FormData object
        selectedFiles.forEach(async (file, index) => {
            const formData = new FormData();
            formData.append(`image`, file);
            try {
                // Make the request to the API
                const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
                const url = `${BACK_HOST}api/v1/humidifier/uploadImages?id=${humidifier.dataId}`;
                let content_length = JSON.stringify(formData).length;
                console.log("Content length : ", content_length)
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    // headers: {
                    // "Content-Type": "application/json",
                    // 'Content-Length': content_length
                    // }
                });
                // Check if the response is successful
                if (response.ok) {
                    const data = await response.json();
                    console.log('Images uploaded successfully:', data);
                    // return data;
                } else {
                    console.error('Image upload failed:', response.status, response.statusText);
                    return null;
                }
            } catch (error) {
                console.error('an error occurred:', error);
                return null;
            }
        });
        uploadTypeOFGrowth();
        // return 0;
    };

    const uploadTypeOFGrowth = async () => {
      
        try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier/updateMould?id=${humidifier.dataId}`;
            let data = {
                'growthType': growthType
            };
            console.log("Data: ", data)
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData
            }

            const res = await response.json();
            toast.success(res.message);
            return res;

        } catch (error) {
            console.error("Error in adding moulds ", error);
            throw error;
        }
    }
    const removePiecesAndUpdateHumidifier = async () => {
   
        try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier?id=${humidifier.serialNo}`;
            let data = {
                'status': 'empty',
                'outTime': new Date()
            };
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData
            }

            const res = await response.json();
            toast.success(`${res.message}`)
            return res;

        } catch (error) {
            console.error("Error in updating humidifier ", error);
            throw error;
        }
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!growthType) {
            toast.error("Please enter the Type of Growth percentage before submitting.");
            return;
        }
        await uploadImagesAndGrowthType();
        await removePiecesAndUpdateHumidifier();
        navigate('/');
        await dispatch(fetchHumidifiers())
    };


    return (
        <div className="bg-gray-50 min-h-screen p-6 pt-24">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">
                            Humidifier: <span className="text-blue-600">{humidifier.serialNo}</span>
                        </h2>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div>
                                <label htmlFor="growthType" className="block text-sm font-medium text-gray-700 mb-2">Type of Growth (%)</label>
                                <input 
                                    type="number" 
                                    id="growthType" 
                                    value={growthType} 
                                    onChange={(e) => setgrowthType(e.target.value)} 
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                    placeholder="Enter growth percentage" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images <span className="text-gray-400 font-normal">(Max 5)</span></label>
                                
                                <input 
                                    type="file" 
                                    id="picture" 
                                    name="picture" 
                                    multiple 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                    className="hidden"
                                    disabled={selectedFiles.length >= 5}
                                />
                                
                                <div className="space-y-4">
                                    <label 
                                        htmlFor="picture" 
                                        className={`inline-flex items-center justify-center px-4 py-2 font-semibold rounded-lg transition-colors w-max 
                                            ${selectedFiles.length >= 5 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'}`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        {selectedFiles.length >= 5 ? 'Limit Reached' : 'Add Images'}
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Preview ${index}`} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-colors shadow-sm"
                                                        title="Remove image"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={handleSubmit} 
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                            >
                                Submit & Empty Humidifier
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/')}
                                className="px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div >

                {/* Tabs */}
                <div className="flex p-1 space-x-1 bg-gray-200/50 rounded-xl">
                    <button
                        className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-200
                            ${activeTab === 'readings' 
                                ? 'bg-white text-blue-700 shadow' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/[0.12]'
                            }`}
                        onClick={() => setActiveTab('readings')}
                    >
                        Reading History
                    </button>
                    <button
                        className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-200
                            ${activeTab === 'contents' 
                                ? 'bg-white text-blue-700 shadow' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/[0.12]'
                            }`}
                        onClick={() => setActiveTab('contents')}
                    >
                         Humidifier Data
                    </button>
                </div>

                {/* Tab Contents */}
                {/* Reading History (Read Only) */}
                {activeTab === 'readings' && (
                     <ReadingsData addedMouldData={addedMouldData} />
                )}
                {/* Humidifier Contents */}
                {activeTab === 'contents' && (
                    <DataInHumidifier dataId={humidifier.dataId} humidifier={humidifier} readOnly={true} />
                )}
            </div>
        </div>
    )
}

export default RemoveMould
