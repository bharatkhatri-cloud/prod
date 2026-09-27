import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from "react-toastify";
import FormatTime from '../../assets/FormatTime';
import { useDispatch, useSelector } from "react-redux";
import { getAddedMouldsData } from '../../reduxStore/Humidifier/HumidifierSlice'
import DataInHumidifier from './DataInHumidifier';
import ReadingsData from './ReadingsData';

const TakeReading = () => {
    const state = useSelector((state) => state.growthChamberReducer)
    const dispatch = useDispatch();

    const location = useLocation();
    const navigate = useNavigate();

    const [humidifier] = useState(location.state.humidifier);
    const [addedMouldData, setAddedMouldsData] = useState({});
    const [readingData, setReadingData] = useState({
        temp: "",
        humidity: ""
    });
    
    // Tab state: 'readings' (History) or 'contents' (DataInHumidifier)
    const [activeTab, setActiveTab] = useState('readings');

    const handleReadingData = (key, value) => {
        setReadingData({ ...readingData, [key]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier/moulds?id=${humidifier.dataId}`;

            let data = {
                'humidityReading': readingData.temp,
                'temperatureReading': readingData.humidity
            };
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData
            }

            const res = await response.json();
            console.log("submit res:", res);
            toast.success(res.message);
            setReadingData({
                temp: "",
                humidity: ""
            });
            dispatch(getAddedMouldsData({ humidifier }))
            return res;

        } catch (error) {
            console.error("Error in adding moulds ", error);
            throw error;
        }
    }


    const removeReading = async (indexNo) => {
        try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier/moulds/removeReadingData?id=${humidifier.dataId}&indexNo=${indexNo}`;
            const response = await fetch(url, {
                method: "DELETE",
                credentials:"include"
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData
            }
            const res = await response.json();
            dispatch(getAddedMouldsData({ humidifier }))
            toast.success(res.message);
            return res;
        } catch (error) {
            console.error("Error in removing reading data", error);
            throw error;
        }
    }

    const allReadingTaken = async () => {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;

        const url = `${BACK_HOST}api/v1/humidifier/readingsFinished?id=${humidifier._id}`;

        try {
            const response = await fetch(url, {
                method: 'PUT'
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData
            }

            const res = await response.json();
            toast.success(res.message);
            navigate('/')
          
            return res;

        } catch (error) {
            console.error("Error in Humidifier filled completely ", error);
            throw error;
        }
    }


    useEffect(() => {
        dispatch(getAddedMouldsData({ humidifier }));
      }, [dispatch]);
    
      useEffect(() => {
        if (state && state.data && state.data.data) {
          setAddedMouldsData(state.data.data);
        }
      }, [state]);

    return (
        <div className="bg-gray-50 min-h-screen p-6 pt-24">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Input Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">
                                Humidifier: <span className="text-blue-600">{humidifier.serialNo}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Batch ID: {addedMouldData?.batchId}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={allReadingTaken} 
                            className="whitespace-nowrap inline-flex justify-center items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Finish Readings
                        </button>
                    </div>

                    <div className="mb-6">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">New Reading</h3>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                Reading #{addedMouldData.temperatureReading ? (addedMouldData.temperatureReading).length + 1 : 1}
                            </span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                                    <input 
                                        type="number" 
                                        name="temp"
                                        value={readingData.temp} 
                                        min={0} max={100}
                                        onChange={(e) => handleReadingData(e.target.name, e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                        placeholder="e.g. 24" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Humidity (%)</label>
                                    <input 
                                        type="number" 
                                        name="humidity"
                                        value={readingData.humidity} 
                                        min={0} max={100}
                                        onChange={(e) => handleReadingData(e.target.name, e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                        placeholder="e.g. 60" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                                >
                                    Submit Reading
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
                    </div>
                </div>

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

                {/* Tab Content: History Table */}
                {activeTab === 'readings' && (
                    <ReadingsData addedMouldData={addedMouldData} removeReading={removeReading} />
                )}
                
                {/* Tab Content: Humidifier Contents */}
                {activeTab === 'contents' && (
                    <DataInHumidifier dataId={humidifier.dataId} humidifier={humidifier} />
                )}
            </div>
        </div>
    )
}

export default TakeReading
