import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessagePop from '../../assets/MessagePop';
import DataInHumidifier from './DataInHumidifier';
import { toast } from "react-toastify";
import { MOULD_ID_LENGTH, MOULD_ID_SUFFIX } from '../../constant';

const PlaceNewPiecesInOven = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [humidifier] = useState(location.state.humidifier);
    const [humidifierNo] = useState(location.state.humidifierNo);
    const [dataId, setDataId] = useState(location.state.dataId);
    const [smFgId, setSmFgId] = useState('');
    const [newIdInfo, setNewIdInfo] = useState({
        humidifierNo: humidifierNo,
        smFgIds: [],
    });

    const addInList = (id) => {
        if (id.startsWith(MOULD_ID_SUFFIX) && id.length >= MOULD_ID_LENGTH) {
            const alreadyPresentInList = newIdInfo.smFgIds.indexOf(id);

            if (alreadyPresentInList > -1) {
                alertMessage(`Can't add! You already scanned this ID: ${newIdInfo.smFgIds[alreadyPresentInList]}`);
                setSmFgId('');
            } else {
                setNewIdInfo((prevState) => ({
                    ...prevState,
                    smFgIds: [...prevState.smFgIds, id],
                }));
                setSmFgId('');
                inputRef.current.focus();
            }
        } else if (id.length >= MOULD_ID_LENGTH) {
            alertMessage(`Can't add! ID must start with ${MOULD_ID_SUFFIX}.`);
        } else if (id.length < MOULD_ID_LENGTH) {
            alertMessage(`Can't add! ID must at least of ${MOULD_ID_LENGTH} character.`);
        }
    };

    //! Start: Message Thing
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const inputRef = useRef();

    const alertMessage = (message) => {
        setModalMessage(message);
        setIsModalOpen(true);
        inputRef.current.blur();
    };
    //! End: Message Thing

    const remove = (index) => {
        const removeIdsArray = newIdInfo.smFgIds.filter((_, i) => i !== index);
        setNewIdInfo((prevState) => ({
            ...prevState,
            smFgIds: [...removeIdsArray],
        }));
    };

    const submitEnteredData = async () => {
        try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier/placePieces`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newIdInfo),
                credentials: 'include'
            })
            if (!res.ok) {
                const errorData = await res.json();
                alertMessage(`Error: ${errorData.message}`);
                return errorData

            }
            const data = await res.json();
            toast.success(`${data.message}`);
            setNewIdInfo((prev) => ({ ...prev, smFgIds: [] }))
            if (data.newHumidifierData?._id) {
                setDataId(data.newHumidifierData._id);
            }
            setRefreshKey(prev => prev + 1); // Trigger data refresh
            return data;

        } catch (error) {
            console.error('Error adding mould:', error);
        }
    };

    const donePlacingMould = async () => {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/humidifier/filledCompletely/${humidifier._id}`;
        try {
          const response = await fetch(url, {
            method: 'PUT',
            credentials: 'include'
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

    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="bg-gray-50 min-h-screen p-6 pt-24">
            <MessagePop
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Input Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Humidifier: <span className="text-blue-600">{newIdInfo.humidifierNo}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Scan or enter ID to place pieces</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => donePlacingMould()} 
                            className="whitespace-nowrap inline-flex justify-center items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Mark as Completely Filled
                        </button>
                    </div>
                   
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Piece ID</label>
                        <div className="flex gap-3">
                            <input
                                name="mouldIds"
                                type="text"
                                value={smFgId || ''}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setSmFgId(value);
                                    if (value.length >= MOULD_ID_LENGTH) {
                                        addInList(value);
                                    }
                                }}
                                ref={inputRef}
                                className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                placeholder={`e.g. ${MOULD_ID_SUFFIX}0012`}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => addInList(smFgId)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {newIdInfo.smFgIds.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Scanned items ({newIdInfo.smFgIds.length}):</h3>
                            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                                {newIdInfo.smFgIds.map((id, index) => (
                                    <div key={index} className="inline-flex items-center bg-white border border-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                        <span className="mr-2">{id}</span>
                                        <button
                                            onClick={() => remove(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => submitEnteredData(newIdInfo)}
                        disabled={newIdInfo.smFgIds.length === 0}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all 
                            ${newIdInfo.smFgIds.length === 0 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'}`}
                    >
                        Submit Scanned Items
                    </button>
                </div>

                {/* Table Data */}
                <DataInHumidifier dataId={dataId} humidifier={humidifier} refreshKey={refreshKey} />
            </div>
        </div>
    );
};

export default PlaceNewPiecesInOven;
