import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormatTime from '../../../assets/FormatTime';
import Loader from '../../../assets/Loader';

const BatchGetReport = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [batchData, setBatchData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batchId) return;
        setIsLoading(true);
        setError(null);

        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        fetch(`${BACK_HOST}api/v2s/oven-in/batch-wise-data?batchIdOfOvenIn=${encodeURIComponent(batchId)}`, {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                const pieces = data?.piecesData?.[0] ?? null;
                setBatchData(pieces);
                setIsLoading(false);
            })
            .catch(() => {
                setError('Failed to load batch report.');
                setIsLoading(false);
            });
    }, [batchId]);

    const pieces = batchData?.ovenInSemiFGIds ?? [];
    const qualityCount = (q) => pieces.filter((p) => p.quality === q).length;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Batch Report</h1>
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3">
                    {error}
                </div>
            )}

            {!isLoading && !error && !batchData && (
                <div className="text-gray-500 text-center py-12">No data found for batch: {batchId}</div>
            )}

            {!isLoading && batchData && (
                <>
                    {/* Batch summary */}
                    <div className="bg-white shadow-md rounded-lg p-5 mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Batch Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Batch ID</span>
                                <span className="font-mono font-semibold">{batchData.batchIdOfOvenIn}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Oven Serial No.</span>
                                <span className="font-semibold">{batchData.ovenSerialNo}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Temperature</span>
                                <span className="font-semibold">{batchData.temp || '—'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Batch In Time</span>
                                <span className="font-semibold">{FormatTime(batchData.batchInTime)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Total Pieces</span>
                                <span className="font-semibold">{pieces.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quality summary */}
                    <div className="bg-white shadow-md rounded-lg p-5 mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quality Breakdown</h2>
                        <div className="flex gap-4 flex-wrap text-sm">
                            {['T2', 'TC', 'T3', 'N/D'].map((q) => (
                                <div key={q} className="flex flex-col items-center bg-gray-50 border rounded px-4 py-2 min-w-[70px]">
                                    <span className="text-gray-500 text-xs">{q}</span>
                                    <span className="text-xl font-bold text-teal-700">{qualityCount(q)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pieces table */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-700">Pieces ({pieces.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">S.No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">FG / SmFG ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Type of Mould</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Quality</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">In Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">In By</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Out Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Out By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pieces.map((p, i) => (
                                        <tr key={i} className="hover:bg-teal-50">
                                            <td className="px-4 py-3 border">{i + 1}</td>
                                            <td className="px-4 py-3 border font-mono">{p.smFgId}</td>
                                            <td className="px-4 py-3 border">
                                                {p.type && p.type !== 'N/D'
                                                    ? <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded">{p.type}</span>
                                                    : <span className="text-gray-400">{p.type || '—'}</span>}
                                            </td>
                                            <td className="px-4 py-3 border">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.quality === 'N/D' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                    {p.quality || 'N/D'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border whitespace-nowrap">{FormatTime(p.inTime)}</td>
                                            <td className="px-4 py-3 border">{p.inBy || '—'}</td>
                                            <td className="px-4 py-3 border whitespace-nowrap">{p.outTime ? FormatTime(p.outTime) : '—'}</td>
                                            <td className="px-4 py-3 border">{p.outBy || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BatchGetReport;
