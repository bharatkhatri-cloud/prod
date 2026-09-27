import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import convertToIST from '../../assets/FormatTime';
import Loader from '../../assets/Loader';

const ViewOvenBatchReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { batchId } = useParams();
    const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';

    // Safely extract oven batch metadata passed in router state
    const ovenMeta = location.state?.oven || {};

    const resolvedBatchId = ovenMeta.batchIdOfOvenIn || batchId;
    const resolvedSerialNo = ovenMeta.ovenSerialNo || (batchId ? batchId.split('D')[0] : '');

    const [piecesList, setPiecesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batchDetails, setBatchDetails] = useState(null);

    useEffect(() => {
        if (!resolvedBatchId || !resolvedSerialNo) {
            return;
        }

        const fetchBatchPieces = async () => {
            setLoading(true);
            try {
                const url = `${BACK_HOST}api/v2s/oven-in/batch-wise-data?batchIdOfOvenIn=${resolvedBatchId}&serialNo=${resolvedSerialNo}`;
                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.piecesData && data.piecesData.length > 0) {
                        const batchObj = data.piecesData[0];
                        setBatchDetails(batchObj);
                        setPiecesList(batchObj.ovenInSemiFGIds || []);
                    }
                } else {
                    console.error("Failed to load batch piece details.");
                }
            } catch (error) {
                console.error("Error while fetching batch pieces: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBatchPieces();
    }, [resolvedBatchId, resolvedSerialNo]);

    // Compute quality counts dynamically from the fetched pieces list
    const t2Count = piecesList.filter((c) => c.quality === 'T2').length;
    const tcCount = piecesList.filter((c) => c.quality === 'TC').length;
    const t3Count = piecesList.filter((c) => c.quality === 'T3').length;
    const ndCount = piecesList.filter((c) => !c.quality || (c.quality !== 'T2' && c.quality !== 'TC' && c.quality !== 'T3')).length;

    // Compute mould type counts dynamically from the fetched pieces list
    const mouldTypeCounts = {};
    piecesList.forEach((item) => {
        const type = item.type || 'N/D';
        mouldTypeCounts[type] = (mouldTypeCounts[type] || 0) + 1;
    });

    const mouldTypesList = Object.entries(mouldTypeCounts).map(([type, count]) => ({
        label: type,
        count: count
    }));

    // Resolve details using state metadata as fallback
    const ovenNo = resolvedSerialNo || (batchDetails ? batchDetails.ovenSerialNo : '');
    const currentBatchId = resolvedBatchId || (batchDetails ? batchDetails.batchIdOfOvenIn : '');
    const tempVal = ovenMeta.temp || (batchDetails ? batchDetails.temp : '');
    const inTimeVal = ovenMeta.batchInTime || (batchDetails ? batchDetails.batchInTime : null);
    const outTimeVal = ovenMeta.batchOutTime || (batchDetails ? batchDetails.batchOutTime : null);

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

            {/* ── Header ── */}
            <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">
                        Heat Treatment
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Oven Data Report</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {ovenNo} &mdash; {currentBatchId}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm bg-white"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* ── Batch Info Card ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Batch Info</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Oven No', value: ovenNo },
                            { label: 'Batch ID', value: currentBatchId },
                            { label: 'Temperature', value: tempVal ? `${tempVal}°C` : '—' },
                            { label: 'In Time', value: inTimeVal ? convertToIST(inTimeVal) : '—' },
                            {
                                label: 'Out Time',
                                value: outTimeVal ? convertToIST(outTimeVal) : null,
                                inProcess: !outTimeVal,
                            },
                            { label: 'Total Pieces', value: piecesList.length },
                        ].map(({ label, value, inProcess }) => (
                            <div key={label} className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                                {inProcess ? (
                                    <span className="text-sm font-semibold text-orange-500">In Process…</span>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── Mould Type Counts (inside Batch Info) ── */}
                    {/* {mouldTypesList.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                                Type of Mould
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {mouldTypesList.map(({ label, count }, idx) => {
                                    const colors = [
                                        'bg-orange-50 text-orange-700 border-orange-200',
                                        'bg-blue-50 text-blue-700 border-blue-200',
                                        'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        'bg-purple-50 text-purple-700 border-purple-200',
                                        'bg-rose-50 text-rose-700 border-rose-200',
                                        'bg-amber-50 text-amber-700 border-amber-200',
                                        'bg-indigo-50 text-indigo-700 border-indigo-200',
                                    ];
                                    const colorClass = label === 'N/D'
                                        ? 'bg-gray-50 text-gray-500 border-gray-200'
                                        : colors[idx % colors.length];
                                    return (
                                        <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${colorClass}`}>
                                            <span className="opacity-75">{label}</span>
                                            <span className="text-base font-extrabold leading-none">{count}</span>
                                            <span className="font-normal opacity-60">piece{count !== 1 ? 's' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )} */}
                </div>

                {/* ── Quality Summary (Exactly like OvenDataReport) ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'T2', count: t2Count, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { label: 'TC', count: tcCount, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                        { label: 'T3', count: t3Count, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                        { label: 'N/D', count: ndCount, color: 'bg-gray-50 border-gray-200 text-gray-600' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className={`rounded-2xl border p-5 flex flex-col items-center gap-1 shadow-sm bg-white ${color}`}>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
                            <span className="text-3xl font-bold">{count}</span>
                            <span className="text-xs opacity-60">piece{count !== 1 ? 's' : ''}</span>
                        </div>
                    ))}
                </div>

                {/* ── Mould Type Breakdown ── */}
                {mouldTypesList.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Mould Type Breakdown</h2>
                        <div className="flex flex-wrap gap-4">
                            {mouldTypesList.map(({ label, count }, idx) => {
                                const colors = [
                                    'bg-orange-50 text-orange-700 border-orange-200',
                                    'bg-blue-50 text-blue-700 border-blue-200',
                                    'bg-emerald-50 text-emerald-700 border-emerald-200',
                                    'bg-purple-50 text-purple-700 border-purple-200',
                                    'bg-rose-50 text-rose-700 border-rose-200',
                                    'bg-amber-50 text-amber-700 border-amber-200',
                                    'bg-indigo-50 text-indigo-700 border-indigo-200',
                                ];
                                const colorClass = colors[idx % colors.length];
                                return (
                                    <div key={label} className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-sm ${colorClass}`}>
                                        <span className="opacity-75">Mould {label}:</span>
                                        <span className="text-lg font-extrabold">{count}</span>
                                        <span className="text-xs font-semibold opacity-60">piece{count !== 1 ? 's' : ''}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Pieces Table ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Pieces Quality</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['S.No', 'Piece ID', 'Type of Mould', 'Quality', 'In Time', 'In By', 'Out Time', 'Out By'].map((h) => (
                                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader />
                                                <span className="text-sm font-semibold text-gray-500">Querying scanned pieces...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && piecesList.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                                            No pieces associated with this batch record.
                                        </td>
                                    </tr>
                                )}

                                {!loading && piecesList.map((currItem, index) => (
                                    <tr key={index} className="hover:bg-orange-50 transition-colors">
                                        <td className="px-5 py-3 text-sm text-gray-400">{index + 1}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-800">{currItem.smFgId}</td>
                                        <td className="px-5 py-3 text-sm text-gray-600">
                                            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                                {currItem.type || 'N/D'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                                currItem.quality === 'T2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                currItem.quality === 'TC' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                currItem.quality === 'T3' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}>
                                                {currItem.quality || 'N/D'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{convertToIST(currItem.inTime)}</td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{currItem.inBy || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {currItem.outTime ? convertToIST(currItem.outTime) : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{currItem.outBy || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                        <span>Total pieces</span>
                        <span className="font-bold text-orange-600">{piecesList.length}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViewOvenBatchReport;
