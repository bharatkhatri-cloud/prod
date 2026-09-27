import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MessagePop from '../../assets/MessagePop';
import DataOfOvenBatchWise from './DataOfOvenBatchWise';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isValidId } from '../../utils/helper/idValidator';
import { OVEN_IN_ID_LENGTH, OVEN_IN_ID_PRIFEX } from '../../constant';

const PlaceNewPiecesInOven = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { batchId: paramBatchId } = useParams();

    const [temp, setTemp] = useState(null);
    const [retrieve, setRetrieve] = useState(false);

    const isCreatePage = location.pathname.includes('/place-mould/create');
    const ovenSerialNo = location.state?.ovenSerialNo;
    const batchId = location.state?.batchId || paramBatchId;
    const tempRequired = location.state?.tempRequired ?? isCreatePage;
    const [smFgId, setSmFgId] = useState('');
    const [newIdInfo, setNewIdInfo] = useState({
        ovenSerialNo: ovenSerialNo,
        batchIdOfOvenIn: batchId,
        temp: temp,
        smFgIds: [],
    });

    useEffect(() => {
        setNewIdInfo((prev) => ({
            ...prev,
            ovenSerialNo: ovenSerialNo,
            batchIdOfOvenIn: batchId,
            smFgIds: [],
        }));
    }, [ovenSerialNo, batchId]);

    useEffect(() => {
        if (temp !== null) {
            setNewIdInfo((prev) => ({
                ...prev,
                temp: temp,
            }));
        }
    }, [temp]);

    const addInList = (id) => {
        if (!id || id.trim() === '') return;
        const trimmedId = id.trim();
        if (isValidId(trimmedId, OVEN_IN_ID_PRIFEX, OVEN_IN_ID_LENGTH).isValid) {
            const alreadyPresentInList = newIdInfo.smFgIds.indexOf(trimmedId);
            if (alreadyPresentInList > -1) {
                alertMessage(`Can't add! You already scanned this ID: ${newIdInfo.smFgIds[alreadyPresentInList]}`);
                setSmFgId('');
            } else {
                setNewIdInfo((prevState) => ({
                    ...prevState,
                    smFgIds: [...prevState.smFgIds, trimmedId],
                }));
                setSmFgId('');
                scannerRef.current.focus();
            }
        } else {
            alertMessage(`${isValidId(trimmedId, OVEN_IN_ID_PRIFEX, OVEN_IN_ID_LENGTH).error}`);
            setSmFgId('');
            scannerRef.current.focus();
        }
    };

    //! Start: Message Thing
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const inputRef = useRef();
    const scannerRef = useRef();

    const alertMessage = (message) => {
        setModalMessage(message);
        setIsModalOpen(true);
        if (scannerRef.current) {
            scannerRef.current.blur();
        } else if (inputRef.current) {
            inputRef.current.blur();
        }
    };
    //! End: Message Thing

    const remove = (index) => {
        const removeIdsArray = newIdInfo.smFgIds.filter((_, i) => i !== index);
        setNewIdInfo((prevState) => ({
            ...prevState,
            smFgIds: [...removeIdsArray],
        }));
    };

    const addNewMouldInOven = async () => {
        try {
            const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${BACK_HOST}api/v2s/oven-in/oven-in-new-pieces`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIdInfo),
                credentials: 'include',
            });
            if (!res.ok) {
                const errorData = await res.json();
                alertMessage(`Error: ${errorData.message}`);
                return errorData;
            }
            const data = await res.json();
            toast.success(data.message);
            setRetrieve(!retrieve);
            setNewIdInfo((prev) => ({ ...prev, smFgIds: [] }));

            if (location.pathname.includes('/place-mould/create')) {
                navigate(`/place-mould/batch/${newIdInfo.batchIdOfOvenIn}`, {
                    replace: true,
                    state: {
                        oven: location.state?.oven,
                        ovenSerialNo: ovenSerialNo,
                        batchId: newIdInfo.batchIdOfOvenIn,
                        tempRequired: false
                    }
                });
            }

            return data;
        } catch (error) {
            console.error('Error adding mould:', error);
        }
    };

    return (
        <>
            <MessagePop
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={() => {
                    setIsModalOpen(false);
                    setTimeout(() => {
                        if (scannerRef.current) {
                            scannerRef.current.focus();
                        }
                    }, 50);
                }}
            />

            <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

                {/* ── Header ── */}
                <div className="max-w-2xl mx-auto mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Oven In</p>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{ovenSerialNo}</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Batch ID: <span className="font-semibold text-gray-600">{batchId}</span>
                        {isCreatePage && (
                            <span className="ml-2 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full inline-block align-middle">
                                Will Create
                            </span>
                        )}
                    </p>
                </div>

                {/* ── Form Card ── */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-5">

                    {/* Temperature input (shown only for new batches) */}
                    {tempRequired && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Batch Temperature
                            </label>
                            <input
                                type="number"
                                name="temp"
                                value={newIdInfo.temp ?? ''}
                                onChange={(e) =>
                                    setNewIdInfo((prev) => ({ ...prev, temp: e.target.value }))
                                }
                                ref={inputRef}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all shadow-sm"
                                placeholder="Enter batch temperature (°C)"
                            />
                        </div>
                    )}

                    {/* Piece ID scanner */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Scan / Enter Piece ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                name="mouldIds"
                                type="text"
                                value={smFgId}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setSmFgId(value);
                                    if (value.length === OVEN_IN_ID_LENGTH) {
                                        addInList(value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addInList(smFgId);
                                    }
                                }}
                                ref={scannerRef}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all shadow-sm"
                                placeholder={`Enter Piece ID`}
                            />
                            <button
                                type="button"
                                onClick={() => addInList(smFgId)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-sm"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Scanned IDs list */}
                    {newIdInfo.smFgIds.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">
                                    Scanned IDs
                                </span>
                                <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                                    {newIdInfo.smFgIds.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {newIdInfo.smFgIds.map((id, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                                    >
                                        <span>{id}</span>
                                        <button
                                            onClick={() => remove(index)}
                                            className="w-4 h-4 rounded-full bg-orange-200 hover:bg-red-300 text-orange-700 hover:text-red-700 flex items-center justify-center transition-colors text-sm leading-none"
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={() => addNewMouldInOven(newIdInfo)}
                        disabled={newIdInfo.smFgIds.length === 0}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit {newIdInfo.smFgIds.length > 0 ? `(${newIdInfo.smFgIds.length} piece${newIdInfo.smFgIds.length !== 1 ? 's' : ''})` : ''}
                    </button>
                </div>

                {/* ── Batch Pieces Table ── */}
                <div className="max-w-2xl mx-auto mt-6">
                    <DataOfOvenBatchWise
                        batchID={batchId}
                        serialNo={ovenSerialNo}
                        setTemp={setTemp}
                        retrieve={retrieve}
                    />
                </div>
            </div>
        </>
    );
};

export default PlaceNewPiecesInOven;
