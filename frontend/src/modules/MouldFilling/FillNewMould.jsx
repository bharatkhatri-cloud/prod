import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToCreateNewMouldFilling, fetchActiveBagMixes } from '../../reduxStore/MouldFilling/MouldFillingSlice';
import { fetchToGetTypeOfMould } from '../../reduxStore/MouldFilling/TypeOfMouldSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MOULD_ID_LENGTH, MOULD_ID_SUFFIX, BAG_ID_LENGTH, BAG_ID_SUFFIX } from '../../constant';
import { expandSequentialRange } from '../../utils/rangeHelper';

const CreateMouldFilling = () => {
    const dispatch = useDispatch();
    const typeOfMouldState = useSelector((state) => state.typeOfMouldReducer);
    const mouldFillingState = useSelector((state) => state.mouldFillingReducer);

    // Modes: 'mix' (breaking machine) vs 'single'
    const [fillingMode, setFillingMode] = useState('mix');

    // Bag input methods: 'range' | 'scan' | 'existing_mix'
    const [bagInputMethod, setBagInputMethod] = useState('range');
    // Mould input methods: 'range' | 'scan'
    const [mouldInputMethod, setMouldInputMethod] = useState('range');

    // Core form state
    const [typeOfMould, setTypeOfMould] = useState('');
    const [customTypeOfMould, setCustomTypeOfMould] = useState('');
    const [filledBy, setFilledBy] = useState('');

    // Range state for Bags
    const [startBagId, setStartBagId] = useState('');
    const [endBagId, setEndBagId] = useState('');
    const [bagRangePreview, setBagRangePreview] = useState([]);
    const [bagRangeError, setBagRangeError] = useState('');

    // Scan state for Bags
    const [currentBagId, setCurrentBagId] = useState('');
    const [scannedBags, setScannedBags] = useState([]);
    const bagInputRef = useRef();

    // Single Bag Mode
    const [singleBagId, setSingleBagId] = useState('');

    // Existing Active Mix selection
    const [selectedMixId, setSelectedMixId] = useState('');

    // Range state for Moulds
    const [startMouldId, setStartMouldId] = useState('');
    const [endMouldId, setEndMouldId] = useState('');
    const [mouldRangePreview, setMouldRangePreview] = useState([]);
    const [mouldRangeError, setMouldRangeError] = useState('');

    // Scan state for Moulds
    const [currentMouldId, setCurrentMouldId] = useState('');
    const [scannedMoulds, setScannedMoulds] = useState([]);
    const mouldInputRef = useRef();

    // Submission result
    const [lastSubmissionResult, setLastSubmissionResult] = useState(null);

    // Fetch types of mould and active mixes on mount
    useEffect(() => {
        dispatch(fetchToGetTypeOfMould());
        dispatch(fetchActiveBagMixes());
    }, [dispatch]);

    // Live range expansion for Bags
    useEffect(() => {
        if (fillingMode === 'mix' && bagInputMethod === 'range' && startBagId.trim() && endBagId.trim()) {
            try {
                const expanded = expandSequentialRange(startBagId, endBagId);
                setBagRangePreview(expanded);
                setBagRangeError('');
            } catch (err) {
                setBagRangePreview([]);
                setBagRangeError(err.message);
            }
        } else {
            setBagRangePreview([]);
            setBagRangeError('');
        }
    }, [startBagId, endBagId, fillingMode, bagInputMethod]);

    // Live range expansion for Moulds
    useEffect(() => {
        if (mouldInputMethod === 'range' && startMouldId.trim() && endMouldId.trim()) {
            try {
                const expanded = expandSequentialRange(startMouldId, endMouldId);
                setMouldRangePreview(expanded);
                setMouldRangeError('');
            } catch (err) {
                setMouldRangePreview([]);
                setMouldRangeError(err.message);
            }
        } else {
            setMouldRangePreview([]);
            setMouldRangeError('');
        }
    }, [startMouldId, endMouldId, mouldInputMethod]);

    // Add scanned bag
    const addScannedBag = (id) => {
        const trimmed = id.trim();
        if (!trimmed) return;
        if (scannedBags.includes(trimmed)) {
            toast.error(`Bag ID "${trimmed}" is already in the mix list`);
            setCurrentBagId('');
            return;
        }
        setScannedBags(prev => [...prev, trimmed]);
        setCurrentBagId('');
        if (bagInputRef.current) bagInputRef.current.focus();
    };

    const handleBagIdInput = (e) => {
        const val = e.target.value;
        setCurrentBagId(val);
        if (val.length >= BAG_ID_LENGTH) {
            addScannedBag(val);
        }
    };

    // Add scanned mould
    const addScannedMould = (id) => {
        const trimmed = id.trim();
        if (!trimmed) return;

        if (scannedMoulds.includes(trimmed)) {
            toast.error(`Mould ID "${trimmed}" is already scanned`);
            setCurrentMouldId('');
            return;
        }

        setScannedMoulds(prev => [...prev, trimmed]);
        setCurrentMouldId('');
        if (mouldInputRef.current) mouldInputRef.current.focus();
    };

    const handleMouldIdInput = (e) => {
        const val = e.target.value;
        setCurrentMouldId(val);
        if (val.length >= MOULD_ID_LENGTH) {
            addScannedMould(val);
        }
    };

    // Derived counts
    const totalBagsCount = fillingMode === 'single'
        ? (singleBagId.trim() ? 1 : 0)
        : (bagInputMethod === 'range'
            ? bagRangePreview.length
            : bagInputMethod === 'scan'
                ? scannedBags.length
                : 1); // for existing mix

    const totalMouldsCount = mouldInputMethod === 'range'
        ? mouldRangePreview.length
        : scannedMoulds.length;

    const yieldRatio = totalBagsCount > 0 && totalMouldsCount > 0
        ? (totalMouldsCount / totalBagsCount).toFixed(2)
        : null;

    // Submit handler
    const submitFilledMouldFillingData = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const selectedType = typeOfMould === '__other__' ? customTypeOfMould.trim() : typeOfMould.trim();
        if (!selectedType) {
            toast.error("Please select or enter the Type of Mould");
            return;
        }

        const payload = {
            typeOfMould: selectedType,
            filledBy: filledBy.trim()
        };

        // 1. Resolve Bags / Mix
        if (fillingMode === 'single') {
            if (!singleBagId.trim()) {
                toast.error("Please input the Bag ID");
                return;
            }
            payload.bagId = singleBagId.trim();
        } else {
            // Multi-Bag Mix mode
            if (bagInputMethod === 'existing_mix') {
                if (!selectedMixId) {
                    toast.error("Please select an active Mix");
                    return;
                }
                payload.mixId = selectedMixId;
            } else if (bagInputMethod === 'range') {
                if (bagRangePreview.length === 0) {
                    toast.error(bagRangeError || "Please specify a valid Bag range");
                    return;
                }
                payload.startBagId = startBagId.trim();
                payload.endBagId = endBagId.trim();
                payload.bagIds = bagRangePreview;
            } else if (bagInputMethod === 'scan') {
                if (scannedBags.length === 0) {
                    toast.error("Please scan at least one Bag ID");
                    return;
                }
                payload.bagIds = scannedBags;
            }
        }

        // 2. Resolve Moulds
        if (mouldInputMethod === 'range') {
            if (mouldRangePreview.length === 0) {
                toast.error(mouldRangeError || "Please specify a valid Mould range");
                return;
            }
            payload.mouldStartId = startMouldId.trim();
            payload.mouldEndId = endMouldId.trim();
            payload.mould = mouldRangePreview.map(id => ({ mouldId: id }));
        } else {
            if (scannedMoulds.length === 0) {
                toast.error("Please scan at least one Mould ID");
                return;
            }
            payload.mould = scannedMoulds.map(id => ({ mouldId: id }));
        }

        try {
            const res = await dispatch(fetchToCreateNewMouldFilling(payload)).unwrap();
            if (res.success) {
                setLastSubmissionResult(res);
                toast.success(res.message || "Moulds and Mix recorded successfully!");
                clearInputsAfterSuccess();
                dispatch(fetchActiveBagMixes());
            }
        } catch (error) {
            console.error("Mould filling submission error:", error);
        }
    };

    const clearInputsAfterSuccess = () => {
        setStartMouldId('');
        setEndMouldId('');
        setScannedMoulds([]);
        setCurrentMouldId('');

        // If in range/scan bag mode, also clear bags
        if (fillingMode === 'mix' && bagInputMethod !== 'existing_mix') {
            setStartBagId('');
            setEndBagId('');
            setScannedBags([]);
            setCurrentBagId('');
        } else if (fillingMode === 'single') {
            setSingleBagId('');
        }
    };

    const clearAll = () => {
        clearInputsAfterSuccess();
        setTypeOfMould('');
        setCustomTypeOfMould('');
        setSelectedMixId('');
        setLastSubmissionResult(null);
    };

    return (
        <div className="max-w-3xl mx-auto my-6 px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-800 to-emerald-900 px-6 py-5 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Mould Filling & Bag Breaking Station</h2>
                            <p className="text-teal-200 text-xs mt-1">
                                Fill moulds from single bags or multi-bag breaking mixes with live sequential & scan support
                            </p>
                        </div>
                        {/* Mode Toggle */}
                        <div className="inline-flex bg-teal-950/60 p-1 rounded-xl border border-teal-700/50">
                            <button
                                type="button"
                                onClick={() => setFillingMode('mix')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    fillingMode === 'mix'
                                        ? 'bg-emerald-500 text-white shadow'
                                        : 'text-teal-200 hover:text-white'
                                }`}
                            >
                                Multi-Bag Mix
                            </button>
                            <button
                                type="button"
                                onClick={() => setFillingMode('single')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    fillingMode === 'single'
                                        ? 'bg-emerald-500 text-white shadow'
                                        : 'text-teal-200 hover:text-white'
                                }`}
                            >
                                Single Bag
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Last Submission Success Callout */}
                    {lastSubmissionResult && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 animate-fade-in">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <strong className="text-emerald-900 text-sm">Batch Successfully Recorded</strong>
                                </div>
                                <p className="text-emerald-700 text-xs">
                                    {lastSubmissionResult.message}
                                </p>
                                {lastSubmissionResult.mixId && (
                                    <div className="inline-block mt-1 font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                                        Assigned Mix ID: {lastSubmissionResult.mixId}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setLastSubmissionResult(null)}
                                className="text-xs text-emerald-600 hover:text-emerald-900 font-semibold"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* SECTION 1: Substrate Source (Bags / Mix) */}
                    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
                                {fillingMode === 'mix' ? "Bag Breaking Machine (Mix Source)" : "Spawn Bag Source"}
                            </label>

                            {fillingMode === 'mix' && (
                                <div className="flex gap-1 text-xs bg-white border border-slate-300 p-0.5 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setBagInputMethod('range')}
                                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                                            bagInputMethod === 'range' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Range (Start - End)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBagInputMethod('scan')}
                                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                                            bagInputMethod === 'scan' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Scan Individual
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBagInputMethod('existing_mix')}
                                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                                            bagInputMethod === 'existing_mix' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Active Mix
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Single Bag View */}
                        {fillingMode === 'single' && (
                            <div>
                                <input
                                    type="text"
                                    value={singleBagId}
                                    onChange={(e) => setSingleBagId(e.target.value)}
                                    placeholder="Scan or enter Bag ID (e.g. SB0125022)"
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Mix Mode: Range View */}
                        {fillingMode === 'mix' && bagInputMethod === 'range' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 block mb-1">Start Bag ID</span>
                                        <input
                                            type="text"
                                            value={startBagId}
                                            onChange={(e) => setStartBagId(e.target.value)}
                                            placeholder="e.g. SB00100"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 block mb-1">End Bag ID</span>
                                        <input
                                            type="text"
                                            value={endBagId}
                                            onChange={(e) => setEndBagId(e.target.value)}
                                            placeholder="e.g. SB00114 (15 bags)"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                        />
                                    </div>
                                </div>

                                {bagRangeError && (
                                    <div className="text-xs text-red-600 font-medium">⚠️ {bagRangeError}</div>
                                )}

                                {bagRangePreview.length > 0 && (
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                        <div className="flex items-center justify-between text-xs text-teal-800 font-bold mb-1">
                                            <span>Sequential Range Generated: {bagRangePreview.length} Bags</span>
                                            <span>{bagRangePreview[0]} &rarr; {bagRangePreview[bagRangePreview.length - 1]}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                                            {bagRangePreview.map((id, idx) => (
                                                <span key={idx} className="bg-white px-2 py-0.5 rounded text-xs text-teal-900 font-mono border border-teal-200">
                                                    {id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mix Mode: Scan View */}
                        {fillingMode === 'mix' && bagInputMethod === 'scan' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        ref={bagInputRef}
                                        value={currentBagId}
                                        onChange={handleBagIdInput}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addScannedBag(currentBagId);
                                            }
                                        }}
                                        placeholder="Scan or enter Bag ID (auto-adds on 9 chars)"
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addScannedBag(currentBagId)}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Add Bag
                                    </button>
                                </div>

                                {scannedBags.length > 0 && (
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                                            <span>Scanned Bags ({scannedBags.length})</span>
                                            <button
                                                type="button"
                                                onClick={() => setScannedBags([])}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Clear Bags
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                            {scannedBags.map((id, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1 bg-teal-50 text-teal-900 border border-teal-200 text-xs font-mono px-2 py-0.5 rounded-full">
                                                    {id}
                                                    <button
                                                        type="button"
                                                        onClick={() => setScannedBags(prev => prev.filter((_, i) => i !== idx))}
                                                        className="text-teal-400 hover:text-red-500 font-bold ml-1"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mix Mode: Active Mix Select */}
                        {fillingMode === 'mix' && bagInputMethod === 'existing_mix' && (
                            <div className="space-y-2">
                                <select
                                    value={selectedMixId}
                                    onChange={(e) => setSelectedMixId(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                >
                                    <option value="">-- Choose an Active Breaking Mix --</option>
                                    {(mouldFillingState.activeMixes || []).map((mix) => (
                                        <option key={mix.mixId} value={mix.mixId}>
                                            {mix.mixId} — ({mix.bagCount} bags, {mix.totalMouldsFilled} moulds so far by {mix.mixedBy})
                                        </option>
                                    ))}
                                </select>
                                {mouldFillingState.activeMixes?.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">
                                        No active breaking mixes found. Use "Range" or "Scan" above to create one.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Mould Details & Scanning */}
                    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
                                Mould Details & IDs
                            </label>

                            <div className="flex gap-1 text-xs bg-white border border-slate-300 p-0.5 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setMouldInputMethod('range')}
                                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                                        mouldInputMethod === 'range' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Range (Start - End)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMouldInputMethod('scan')}
                                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                                        mouldInputMethod === 'scan' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Scan Individual
                                </button>
                            </div>
                        </div>

                        {/* Mould Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 block mb-1">Type of Mould</span>
                                <select
                                    value={typeOfMould}
                                    onChange={(e) => setTypeOfMould(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                >
                                    <option value="">-- Select Type of Mould --</option>
                                    {(typeOfMouldState?.data?.typeOfMouldData || []).map((t) => (
                                        <option key={t._id} value={t.typeOfMould}>
                                            {t.typeOfMould}
                                        </option>
                                    ))}
                                    <option value="__other__">+ Enter Custom Type...</option>
                                </select>
                            </div>

                            {typeOfMould === '__other__' && (
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">Custom Mould Name</span>
                                    <input
                                        type="text"
                                        value={customTypeOfMould}
                                        onChange={(e) => setCustomTypeOfMould(e.target.value)}
                                        placeholder="e.g. 4-Corner Pad 50mm"
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <span className="text-xs font-semibold text-slate-500 block mb-1">Filled By (Operator)</span>
                                <input
                                    type="text"
                                    value={filledBy}
                                    onChange={(e) => setFilledBy(e.target.value)}
                                    placeholder="Enter operator name"
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Mould Range View */}
                        {mouldInputMethod === 'range' && (
                            <div className="space-y-3 pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 block mb-1">Start Mould ID</span>
                                        <input
                                            type="text"
                                            value={startMouldId}
                                            onChange={(e) => setStartMouldId(e.target.value)}
                                            placeholder="e.g. M00200"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 block mb-1">End Mould ID</span>
                                        <input
                                            type="text"
                                            value={endMouldId}
                                            onChange={(e) => setEndMouldId(e.target.value)}
                                            placeholder="e.g. M00227 (28 moulds)"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                        />
                                    </div>
                                </div>

                                {mouldRangeError && (
                                    <div className="text-xs text-red-600 font-medium">⚠️ {mouldRangeError}</div>
                                )}

                                {mouldRangePreview.length > 0 && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
                                            <span>Sequential Range Generated: {mouldRangePreview.length} Moulds</span>
                                            <span>{mouldRangePreview[0]} &rarr; {mouldRangePreview[mouldRangePreview.length - 1]}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                                            {mouldRangePreview.map((id, idx) => (
                                                <span key={idx} className="bg-white px-2 py-0.5 rounded text-xs text-emerald-950 font-mono border border-emerald-200">
                                                    {id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mould Scan View */}
                        {mouldInputMethod === 'scan' && (
                            <div className="space-y-3 pt-1">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        ref={mouldInputRef}
                                        value={currentMouldId}
                                        onChange={handleMouldIdInput}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addScannedMould(currentMouldId);
                                            }
                                        }}
                                        placeholder={`Scan Mould ID (auto-adds on ${MOULD_ID_LENGTH} chars e.g. ${MOULD_ID_SUFFIX}...)`}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addScannedMould(currentMouldId)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Add Mould
                                    </button>
                                </div>

                                {scannedMoulds.length > 0 && (
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                                            <span>Scanned Moulds ({scannedMoulds.length})</span>
                                            <button
                                                type="button"
                                                onClick={() => setScannedMoulds([])}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Clear Moulds
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                            {scannedMoulds.map((id, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono px-2 py-0.5 rounded-full">
                                                    {id}
                                                    <button
                                                        type="button"
                                                        onClick={() => setScannedMoulds(prev => prev.filter((_, i) => i !== idx))}
                                                        className="text-emerald-400 hover:text-red-500 font-bold ml-1"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: Yield & Production Metrics Banner */}
                    <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-slate-50 border border-teal-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="bg-white px-3 py-2 rounded-lg border border-teal-100 shadow-sm">
                                <span className="text-slate-500 block">Substrate Input</span>
                                <strong className="text-sm text-teal-800">{totalBagsCount} Bag{totalBagsCount === 1 ? '' : 's'}</strong>
                            </div>
                            <div className="text-slate-400 text-lg">&rarr;</div>
                            <div className="bg-white px-3 py-2 rounded-lg border border-teal-100 shadow-sm">
                                <span className="text-slate-500 block">Mould Output</span>
                                <strong className="text-sm text-emerald-800">{totalMouldsCount} Mould{totalMouldsCount === 1 ? '' : 's'}</strong>
                            </div>
                            {yieldRatio && (
                                <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 shadow-sm">
                                    <span className="text-slate-500 block">Calculated Yield</span>
                                    <strong className="text-sm text-emerald-600">{yieldRatio} moulds / bag</strong>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={clearAll}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={submitFilledMouldFillingData}
                                disabled={totalMouldsCount === 0 || totalBagsCount === 0}
                                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                                    totalMouldsCount === 0 || totalBagsCount === 0
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/30'
                                }`}
                            >
                                Submit & Link Batch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMouldFilling;
