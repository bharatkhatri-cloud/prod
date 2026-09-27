import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SMFGMouldInBatch from "./components/SMFGMouldInBatch";
import SMFGReadingsTable from "./components/SMFGReadingsTable";
import {
    fetchChamberData,
    submitBatchReading,
    restartCycle,
    completeCycle,
} from "./api/smFgGrowthApis";
import { fetchSmfgBatchInfo, fetchSmfgMouldsByBatch } from "../../../reduxStore/Humidifier/SmFgGrowthSlice";

const SMFGTakeReadings = () => {
    const { serialNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [chamber, setChamber] = useState(null);

    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const batchInfo = useSelector((state) => state.smFgGrowthReducer.batchInfo);
    const mouldsByBatch = useSelector((state) => state.smFgGrowthReducer.mouldsByBatch);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("form");
    const [refreshReadingsTrigger, setRefreshReadingsTrigger] = useState(0);
    const [showRestartModal, setShowRestartModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [manualCycleTime, setManualCycleTime] = useState("");

    const MOULD_ID_PREFIX = "M";
    const MOULD_ID_LENGTH = 7;
    const [currentMouldInput, setCurrentMouldInput] = useState("");
    const [mouldScanList, setMouldScanList] = useState([]);
    const [removedMoulds, setRemovedMoulds] = useState([]);

    const [transferInInput, setTransferInInput] = useState("");
    const [transferInList, setTransferInList] = useState([]);
    const [submittedTransferIn, setSubmittedTransferIn] = useState([]);

    const [transferOutInput, setTransferOutInput] = useState("");
    const [transferOutList, setTransferOutList] = useState([]);
    const [targetChamber, setTargetChamber] = useState("");
    const [submittedTransferOut, setSubmittedTransferOut] = useState([]);

    useEffect(() => {
        if (!serialNo) {
            navigate("/smfg-growth");
            return;
        }
        const loadChamberData = async () => {
            try {
                const response = await fetchChamberData(serialNo);
                if (response.ok) {
                    const data = await response.json();
                    setChamber(data);
                } else {
                    navigate("/smfg-growth");
                }
            } catch (err) {
                console.error("Failed to fetch chamber data", err);
                navigate("/smfg-growth");
            }
        };
        loadChamberData();
    }, [serialNo, navigate, refreshReadingsTrigger]);

    useEffect(() => {
        const batchId = chamber?.activeBatches?.[0]?.batchId;
        if (batchId) {
            dispatch(fetchSmfgBatchInfo(batchId));
            dispatch(fetchSmfgMouldsByBatch(batchId));
        }
    }, [chamber, dispatch, refreshReadingsTrigger]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, "0");
        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };

    const calculateActualCycleTime = (start, end) => {
        if (!start || !end) return "RUNNING";
        const diffInHours = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
        return `${diffInHours.toFixed(2)} hrs`;
    };

    const handleSubmitReading = async (e) => {
        e.preventDefault();
        if (!temperature || !humidity) {
            toast.error("Please enter both temperature and humidity");
            return;
        }
        if (temperature < 1 || temperature > 100 || humidity < 1 || humidity > 100) {
            toast.error("Temperature and humidity must be between 1 and 100");
            return;
        }
        setSubmitting(true);
        try {
            const batchId = chamber?.activeBatches?.[0]?.batchId;
            if (!batchId) {
                toast.error("No active batch found.");
                return;
            }
            const response = await submitBatchReading(batchId, parseFloat(temperature), parseFloat(humidity));
            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || "Failed to submit reading");
            } else {
                toast.success("Reading submitted successfully!");
                setTemperature("");
                setHumidity("");
                setRefreshReadingsTrigger((prev) => prev + 1);
            }
        } catch (err) {
            toast.error("Network error while submitting reading.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestartCycle = async () => {
        try {
            setSubmitting(true);
            const batchId = chamber?.activeBatches?.[0]?.batchId;
            if (!batchId) {
                toast.error("No active batch found.");
                return;
            }
            const response = await restartCycle(batchId, manualCycleTime);
            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || "Failed to restart cycle");
            } else {
                toast.success("Cycle restarted successfully!");
        
                setRefreshReadingsTrigger((prev) => prev + 1);
                setShowRestartModal(false);
                setManualCycleTime("");
            }
        } catch (err) {
            toast.error("Network error while restarting cycle.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteCycle = async () => {
        try {
            setSubmitting(true);
            const batchId = chamber?.activeBatches?.[0]?.batchId;
            if (!batchId) {
                toast.error("No active batch found.");
                return;
            }
            const response = await completeCycle(batchId);
            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || "Failed to complete cycle");
            } else {
                toast.success("Batch cycle completely finished!");
                setShowCompleteModal(false);
                navigate(`/smfg-growth/remove-mould/${serialNo}`);
            }
        } catch (err) {
            toast.error("Network error while completing cycle.");
        } finally {
            setSubmitting(false);
        }
    };

    const makeScanHandler = (list, setList, setInput) => (e) => {
        const val = e.target.value.toUpperCase();
        setInput(val);
        const trimmed = val.trim();
        if (trimmed.length === MOULD_ID_LENGTH && trimmed.startsWith(MOULD_ID_PREFIX)) {
            if (list.includes(trimmed)) {
                toast.warning("Mould already in the list");
                setInput("");
            } else {
                setList((prev) => [...prev, trimmed]);
                setInput("");
                toast.success("Mould scanned");
            }
        }
    };

    const handleTransferInInput = makeScanHandler(transferInList, setTransferInList, setTransferInInput);
    const handleTransferOutInput = makeScanHandler(transferOutList, setTransferOutList, setTransferOutInput);

    const handleSubmitTransferIn = () => {
        if (transferInList.length === 0) return;
        const now = new Date().toISOString();
        const batchId = chamber?.activeBatches?.[0]?.batchId;
        setSubmittedTransferIn((prev) => [
            ...prev,
            ...transferInList.map((id) => ({ mouldId: id, transferredAt: now, intoBatch: batchId })),
        ]);
        setTransferInList([]);
        toast.success(`${transferInList.length} mould(s) transferred into this batch`);
    };

    const handleSubmitTransferOut = () => {
        if (transferOutList.length === 0) return;
        if (!targetChamber.trim()) {
            toast.error("Please enter a target chamber / batch ID");
            return;
        }
        const now = new Date().toISOString();
        setSubmittedTransferOut((prev) => [
            ...prev,
            ...transferOutList.map((id) => ({ mouldId: id, transferredAt: now, toChamber: targetChamber.trim() })),
        ]);
        setTransferOutList([]);
        setTargetChamber("");
        toast.success(`${transferOutList.length} mould(s) transferred out`);
    };

    const handleMouldScanInput = (e) => {
        const val = e.target.value.toUpperCase();
        setCurrentMouldInput(val);
        const trimmed = val.trim();
        if (trimmed.length === MOULD_ID_LENGTH && trimmed.startsWith(MOULD_ID_PREFIX)) {
            if (mouldScanList.includes(trimmed)) {
                toast.warning("Mould already in the list");
                setCurrentMouldInput("");
            } else {
                setMouldScanList((prev) => [...prev, trimmed]);
                setCurrentMouldInput("");
                toast.success("Mould scanned");
            }
        }
    };

    const removeMouldFromScanList = (index) => {
        setMouldScanList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitRemovedMoulds = () => {
        if (mouldScanList.length === 0) return;
        const now = new Date().toISOString();
        const newRemoved = mouldScanList.map((id) => ({ mouldId: id, removedAt: now }));
        setRemovedMoulds((prev) => [...prev, ...newRemoved]);
        setMouldScanList([]);
        toast.success(`${newRemoved.length} mould(s) marked for removal`);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Take Readings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <p className="text-gray-500">Chamber: <span className="font-bold text-gray-700">{chamber?.serialNo}</span></p>
                            <p className="text-gray-500">Batch: <span className="font-bold text-gray-700">{chamber?.activeBatches?.[0]?.batchId}</span></p>
                            <p className="text-gray-500">Total Mould: <span className="font-bold text-gray-700">{mouldsByBatch?.length || 0}</span></p>
                            <p className="text-gray-500">Batch started at: <span className="font-bold text-gray-700">{formatDateTime(batchInfo?.placingTime) || "Not started yet"}</span></p>
                            <p className="text-gray-500">Batch completely filled: <span className="font-bold text-gray-700">{formatDateTime(batchInfo?.markAsFilledTime) || "Mould is scanning..."}</span></p>
                            {batchInfo?.cycleEvents && batchInfo.cycleEvents.length > 0 && (
                                <p className="text-gray-500">Current Cycle: <span className="font-bold text-blue-700">Cycle #{batchInfo.cycleEvents[batchInfo.cycleEvents.length - 1].cycleNumber}</span></p>
                            )}
                            {batchInfo?.readingsFinishedTime && (
                                <p className="text-gray-500">Cycles completed: <span className="font-bold text-purple-700">{formatDateTime(batchInfo?.readingsFinishedTime)}</span></p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/smfg-growth")}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Back to Chamber
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {[
                        { key: "form", label: "New Reading", color: "blue" },
                        { key: "data", label: "Batch Contents", color: "blue" },
                        { key: "remove", label: "Remove Mould", color: "red" },
                        { key: "transferIn", label: "Transfer In", color: "emerald" },
                        { key: "transferOut", label: "Transfer Out", color: "orange" },
                    ].map(({ key, label, color }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === key
                                ? `border-b-2 border-${color}-500 text-${color}-600`
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === "form" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reading Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Enter Current Readings</h3>
                            <form onSubmit={handleSubmitReading} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                                    <input
                                        type="number" step="0.1" value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. 25.5" min="1" max="100" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                                    <input
                                        type="number" step="0.1" value={humidity}
                                        onChange={(e) => setHumidity(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. 85" min="1" max="100" required
                                    />
                                </div>
                                <button
                                    type="submit" disabled={submitting}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? "Submitting..." : "Submit Reading"}
                                </button>
                            </form>
                        </div>

                        {/* Cycle Actions Panel */}
                        {batchInfo?.markAsFilledTime ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center space-y-4">
                                <div className="w-full flex justify-end">
                                    <button
                                        onClick={() => setShowRestartModal(true)}
                                        disabled={batchInfo?.readingsFinishedTime}
                                        className={`py-1.5 px-3 text-white text-xs font-bold rounded-lg shadow-sm transform active:scale-95 transition-all flex items-center gap-1 ${batchInfo?.readingsFinishedTime ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Start New Cycle
                                    </button>
                                </div>
                                {batchInfo?.cycleEvents && batchInfo.cycleEvents.length > 0 && (
                                    <div className="text-left w-full space-y-2 max-h-48 overflow-y-auto mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700">Cycle History:</h4>
                                        {[...batchInfo.cycleEvents].reverse().map((cycle, idx) => (
                                            <div key={idx} className={`text-xs p-2 rounded-lg border ${idx === 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                                                <p className="font-bold text-gray-700">Cycle #{cycle.cycleNumber} {idx === 0 ? "(Current)" : "(Completed)"}</p>
                                                <p>Started at: {formatDateTime(cycle.openingTime)}</p>
                                                <p>Scheduled for: {cycle.cycleTime ? `${cycle.cycleTime} hrs` : "N/A"}</p>
                                                {(cycle.startedBy || cycle.openedBy) && <p>Started By: {cycle.startedBy || cycle.openedBy}</p>}
                                                <p>Actual time: {calculateActualCycleTime(cycle.openingTime, cycle.cycleEndedAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowCompleteModal(true)}
                                    disabled={submitting || batchInfo?.readingsFinishedTime}
                                    className={`mt-4 py-3 px-6 text-white font-bold rounded-xl shadow-md transform active:scale-95 transition-all ${batchInfo?.readingsFinishedTime ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                                >
                                    {batchInfo?.readingsFinishedTime ? "Cycle Completely Finished" : "Cycle Completed"}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
                                <p className="text-gray-500">Cycle not started yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "form" && (
                    <div className="mt-6">
                        <SMFGReadingsTable
                            batchId={chamber?.activeBatches?.[0]?.batchId}
                            refreshTrigger={refreshReadingsTrigger}
                        />
                    </div>
                )}

                {activeTab === "data" && (
                    <SMFGMouldInBatch dataId={chamber?.activeBatches?.[0]?.batchId} readOnly={true} />
                )}

                {activeTab === "remove" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Scan Mould IDs to Remove</h3>
                            <input
                                type="text" value={currentMouldInput} onChange={handleMouldScanInput}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono uppercase"
                                placeholder="Scan Mould ID (e.g. M123456)" maxLength={7} autoFocus
                            />
                            {mouldScanList.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Scanned ({mouldScanList.length})</span>
                                        <button onClick={() => setMouldScanList([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        {mouldScanList.map((id, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                                <span className="text-sm font-mono text-gray-700">{id}</span>
                                                <button onClick={() => removeMouldFromScanList(idx)} className="text-gray-400 hover:text-red-500">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleSubmitRemovedMoulds} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition-colors">
                                        Submit — Remove {mouldScanList.length} Mould(s) from Batch
                                    </button>
                                </div>
                            )}
                        </div>

                        {removedMoulds.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Removed Moulds</h3>
                                    <p className="text-xs text-gray-500">Total: {removedMoulds.length}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">S.No.</th>
                                                <th className="px-6 py-3">Mould ID</th>
                                                <th className="px-6 py-3">Removed At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {removedMoulds.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                                    <td className="px-6 py-3 text-sm font-mono font-semibold text-gray-800">{item.mouldId}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">{formatDateTime(item.removedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "transferIn" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Transfer Moulds Into This Batch</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                Scan mould IDs that you want to move <span className="font-semibold text-emerald-600">into</span> batch{" "}
                                <span className="font-mono font-bold text-gray-700">{chamber?.activeBatches?.[0]?.batchId}</span>
                            </p>
                            <input
                                type="text" value={transferInInput} onChange={handleTransferInInput}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono uppercase"
                                placeholder="Scan Mould ID (e.g. M123456)" maxLength={7} autoFocus
                            />
                            {transferInList.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Scanned ({transferInList.length})</span>
                                        <button onClick={() => setTransferInList([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        {transferInList.map((id, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                                <span className="text-sm font-mono text-gray-700">{id}</span>
                                                <button onClick={() => setTransferInList((p) => p.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleSubmitTransferIn} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition-colors">
                                        Confirm Transfer — Add {transferInList.length} Mould(s) to This Batch
                                    </button>
                                </div>
                            )}
                        </div>

                        {submittedTransferIn.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Transferred In</h3>
                                    <p className="text-xs text-gray-500">Total: {submittedTransferIn.length}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">S.No.</th>
                                                <th className="px-6 py-3">Mould ID</th>
                                                <th className="px-6 py-3">Into Batch</th>
                                                <th className="px-6 py-3">Transferred At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {submittedTransferIn.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                                    <td className="px-6 py-3 text-sm font-mono font-semibold text-gray-800">{item.mouldId}</td>
                                                    <td className="px-6 py-3 text-sm font-mono text-emerald-700">{item.intoBatch}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">{formatDateTime(item.transferredAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "transferOut" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Transfer Moulds to Another Chamber</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                Scan moulds from batch{" "}
                                <span className="font-mono font-bold text-gray-700">{chamber?.activeBatches?.[0]?.batchId}</span>{" "}
                                and specify the <span className="font-semibold text-orange-600">target chamber</span> to send them to.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Chamber / Batch ID</label>
                                    <input
                                        type="text" value={targetChamber}
                                        onChange={(e) => setTargetChamber(e.target.value.toUpperCase())}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono uppercase"
                                        placeholder="e.g. B1 or B1D17052026T1510"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scan Mould ID</label>
                                    <input
                                        type="text" value={transferOutInput} onChange={handleTransferOutInput}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono uppercase"
                                        placeholder="Scan Mould ID (e.g. M123456)" maxLength={7}
                                    />
                                </div>
                            </div>
                            {transferOutList.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Scanned ({transferOutList.length})</span>
                                        <button onClick={() => setTransferOutList([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        {transferOutList.map((id, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                                <span className="text-sm font-mono text-gray-700">{id}</span>
                                                <button onClick={() => setTransferOutList((p) => p.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleSubmitTransferOut} disabled={!targetChamber.trim()} className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        Confirm Transfer — Send {transferOutList.length} Mould(s) to {targetChamber || "…"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {submittedTransferOut.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Transferred Out</h3>
                                    <p className="text-xs text-gray-500">Total: {submittedTransferOut.length}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">S.No.</th>
                                                <th className="px-6 py-3">Mould ID</th>
                                                <th className="px-6 py-3">To Chamber</th>
                                                <th className="px-6 py-3">Transferred At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {submittedTransferOut.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                                    <td className="px-6 py-3 text-sm font-mono font-semibold text-gray-800">{item.mouldId}</td>
                                                    <td className="px-6 py-3 text-sm font-mono text-orange-700">{item.toChamber}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">{formatDateTime(item.transferredAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Restart Cycle Modal */}
            {showRestartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Restart Cycle?</h3>
                            <p className="text-center text-gray-500 mb-4">Are you sure you want to end the current cycle and start a new one?</p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Duration for New Cycle (Hours)</label>
                                <input
                                    type="number" step="0.01" min="0" value={manualCycleTime}
                                    onChange={(e) => setManualCycleTime(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="e.g. 12.5"
                                />
                                <p className="text-xs text-gray-400 mt-1">Set an expected duration for the next cycle.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowRestartModal(false)} disabled={submitting} className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors">Cancel</button>
                                <button onClick={handleRestartCycle} disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center">
                                    {submitting ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Restart Now"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Cycle Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Complete Cycles?</h3>
                            <p className="text-center text-gray-500 mb-6">Are you sure you want to completely finish all cycles? You will not be able to add new readings after this.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCompleteModal(false)} disabled={submitting} className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors">Cancel</button>
                                <button onClick={handleCompleteCycle} disabled={submitting} className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center">
                                    {submitting ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Finish Cycles"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SMFGTakeReadings;
