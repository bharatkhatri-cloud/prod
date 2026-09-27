import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessagePop from '../../assets/MessagePop';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OVEN_OUT_ID_LENGTH, OVEN_OUT_ID_PRIFEX } from '../../constant';
import { isValidId } from '../../utils/helper/idValidator';

const ScanNewPiecesToDefinedQuality = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [quality] = useState(location.state?.quality || 'T2');

    const [fgId, setFgId] = useState('');
    const [newIdInfo, setNewIdInfo] = useState({
        quality: quality,
        fgId: [],
    });

    const addInList = (id) => {
        if (isValidId(id, OVEN_OUT_ID_PRIFEX, OVEN_OUT_ID_LENGTH).isValid) {
            const alreadyPresentInList = newIdInfo.fgId.indexOf(id);

            if (alreadyPresentInList > -1) {
                alertMessage(`Can't add! You already scanned this ID: ${newIdInfo.fgId[alreadyPresentInList]}`);
                setFgId('');
            } else {
                setNewIdInfo((prevState) => ({
                    ...prevState,
                    fgId: [...prevState.fgId, id],
                }));
                setFgId('');
                inputRef.current.focus();
            }
        } else {
            alertMessage(`${isValidId(id, OVEN_OUT_ID_PRIFEX, OVEN_OUT_ID_LENGTH).error}`);
            setFgId('');
            inputRef.current.focus();
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
        const removeIdsArray = newIdInfo.fgId.filter((_, i) => i !== index);
        setNewIdInfo((prevState) => ({
            ...prevState,
            fgId: [...removeIdsArray],
        }));
    };

    const submitNewInfoOfFg = async () => {
        try {
            const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${BACK_HOST}api/v2s/oven-out/defined-quality`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIdInfo),
                credentials: 'include'
            });
            if (!res.ok) {
                const errorData = await res.json();
                alertMessage(`Error: ${errorData.message}`);
                return errorData;
            }
            const data = await res.json();
            toast.success(`${data.message}`);
            setNewIdInfo((prev) => ({ ...prev, fgId: [] }));
            return data;
        } catch (error) {
            console.error('Error adding mould:', error);
        }
    };

    // Quality-specific theme configuration
    const config = {
        T2: {
            text: 'text-blue-500',
            bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
            btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white',
            ring: 'focus:ring-blue-400/30 focus:border-blue-400',
            badge: 'bg-blue-50 border-blue-200 text-blue-700',
            accent: 'text-blue-600',
            tag: 'T2'
        },
        TC: {
            text: 'text-emerald-500',
            bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300 text-white',
            ring: 'focus:ring-emerald-400/30 focus:border-emerald-400',
            badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            accent: 'text-emerald-600',
            tag: 'TC'
        },
        T3: {
            text: 'text-purple-500',
            bgLight: 'bg-purple-50 border-purple-200 text-purple-700',
            btn: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300 text-white',
            ring: 'focus:ring-purple-400/30 focus:border-purple-400',
            badge: 'bg-purple-50 border-purple-200 text-purple-700',
            accent: 'text-purple-600',
            tag: 'T3'
        }
    };

    const theme = config[quality] || config.T2;

    return (
        <>
            <MessagePop
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

                {/* ── Header ── */}
                <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
                            Oven Out
                        </p>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Scan pieces to quality</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Quality defined: <span className={`font-bold px-2 py-0.5 rounded-md text-xs border ${theme.badge}`}>{quality}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* ── Scanner Card ── */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-5">
                    
                    {/* Enter ID */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Scan / Enter Finished Goods ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                name="fgId"
                                type="text"
                                value={fgId}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setFgId(value);
                                    if (value.length === OVEN_OUT_ID_LENGTH) {
                                        addInList(value);
                                    }
                                }}
                                ref={inputRef}
                                className={`flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.ring} transition-all shadow-sm`}
                                placeholder="Enter FG ID"
                            />
                            <button
                                type="button"
                                onClick={() => addInList(fgId)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${theme.btn}`}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Scanned Items */}
                    {newIdInfo.fgId.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">
                                    Scanned IDs
                                </span>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                                    {newIdInfo.fgId.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {newIdInfo.fgId.map((id, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-full ${theme.badge}`}
                                    >
                                        <span>{index + 1}. {id}</span>
                                        <button
                                            onClick={() => remove(index)}
                                            className="w-4 h-4 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 flex items-center justify-center transition-colors text-sm leading-none"
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

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={() => submitNewInfoOfFg()}
                        disabled={newIdInfo.fgId.length === 0}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed ${
                            newIdInfo.fgId.length > 0 ? theme.btn : ''
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Quality Definition {newIdInfo.fgId.length > 0 ? `(${newIdInfo.fgId.length} piece${newIdInfo.fgId.length !== 1 ? 's' : ''})` : ''}
                    </button>

                </div>

            </div>
        </>
    );
};

export default ScanNewPiecesToDefinedQuality;