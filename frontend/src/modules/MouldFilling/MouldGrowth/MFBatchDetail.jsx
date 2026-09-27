import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import convertToIST from '../../../assets/FormatTime';
import Loader from '../../../assets/Loader';
import { fetchBatchDetails } from './api/mouldFillingApis';

const calculateDuration = (start, end) => {
    if (!start) return '—';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    
    const diffMs = endTime - startTime;
    if (diffMs < 0) return '—';
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}${!end ? ' (running)' : ''}`;
    }
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}${!end ? ' (running)' : ''}`;
};

const MFBatchDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const batchId = location.state?.humidifier?.batchId;

    const [batchDetails, setBatchDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const [resultPerPage] = useState(10);
    const [queryParams, setQueryParams] = useState({ page: 1, resultPerPage: 10 });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        if (!batchId) {
            setLoading(false);
            return;
        }
        const fetchDetails = async () => {
            try {
                const response = await fetchBatchDetails(batchId);
                if (response.ok) {
                    const data = await response.json();
                    setBatchDetails(data);
                }
            } catch (error) {
                console.error("Failed to fetch batch details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [batchId]);

    if (!batchId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-gray-500 mb-4">No batch ID provided.</p>
                <button
                    onClick={() => navigate('/mould-filling/batch-data')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to History
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (!batchDetails || !batchDetails.batchInfo) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-gray-500 mb-4">No batch data available.</p>
                <button
                    onClick={() => navigate('/mould-filling/batch-data')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to History
                </button>
            </div>
        );
    }

    const { batchInfo, moulds } = batchDetails;
    
    // Filter moulds by Mould Type
    const filteredMoulds = moulds?.filter(mould => 
        mould.typeOfMould?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    // Pagination Logic for Moulds
    const totalFiltered = filteredMoulds.length;
    const indexOfLastMould = queryParams.page * queryParams.resultPerPage;
    const indexOfFirstMould = indexOfLastMould - queryParams.resultPerPage;
    const currentMoulds = filteredMoulds.slice(indexOfFirstMould, indexOfLastMould);
    
    const fromItem = totalFiltered === 0 ? 0 : indexOfFirstMould + 1;
    const toItem = Math.min(indexOfLastMould, totalFiltered);
    const currentItemCount = toItem - fromItem + 1;

    return (
        <div className="bg-gray-50 min-h-screen p-6 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Batch Details</h1>
                    <button
                        onClick={() => navigate('/mould-filling/batch-data')}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Back to History
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">General Information</h2>
                    </div>
                    <table className="w-full text-left text-sm text-gray-600">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500 w-1/3">Humidifier No</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{batchInfo.humidifierNo}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Batch ID</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{batchInfo.batchId}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Filling Status</td>
                                <td className="px-6 py-4">
                                    {batchInfo.markAsFilledTime ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-gray-800 font-medium">{convertToIST(batchInfo.markAsFilledTime)}</span>
                                            <span className="text-xs text-gray-400 font-normal">Cycle Started</span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.25)] animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                                            Currently Filling
                                        </span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Placed By</td>
                                <td className="px-6 py-4 text-gray-800">{batchInfo.placedBy || '—'}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Placing Time</td>
                                <td className="px-6 py-4 text-gray-800">{convertToIST(batchInfo.placingTime)}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Removal Time</td>
                                <td className="px-6 py-4 text-gray-800">
                                    {batchInfo.removedTime ? convertToIST(batchInfo.removedTime) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-lg shadow-green-200">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Currently in Chamber
                                        </span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Cycle Duration</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">
                                    {calculateDuration(batchInfo.placingTime, batchInfo.removedTime)}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Growth Type</td>
                                <td className="px-6 py-4 text-gray-800">{batchInfo.growthType ? `${batchInfo.growthType}%` : '—'}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Department</td>
                                <td className="px-6 py-4 text-gray-800">{batchInfo.department || '—'}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-500">Mould Breakdown</td>
                                <td className="px-6 py-4 flex flex-wrap gap-2">
                                    {batchDetails.mouldTypeCounts && Object.entries(batchDetails.mouldTypeCounts).map(([type, count]) => (
                                        <span 
                                            key={type}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/50 shadow-sm"
                                        >
                                            <span className="font-bold mr-1">{type}:</span> {count}
                                        </span>
                                    ))}
                                    {(!batchDetails.mouldTypeCounts || Object.keys(batchDetails.mouldTypeCounts).length === 0) && (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Moulds Table */}
                <div className="mt-6 bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-lg font-bold text-gray-800">Moulds in this Batch ({totalFiltered})</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search mould type..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setQueryParams(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">S.No</th>
                                    <th className="px-6 py-3">Mould ID</th>
                                    <th className="px-6 py-3">Bag ID</th>
                                    <th className="px-6 py-3">Type of Mould</th>
                                    <th className="px-6 py-3">Filled By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentMoulds.map((mould, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-400">{indexOfFirstMould + index + 1}</td>
                                        <td className="px-6 py-3 text-gray-800 font-semibold">{mould.mouldId}</td>
                                        <td className="px-6 py-3 text-gray-800">{mould.bagId}</td>
                                        <td className="px-6 py-3 text-gray-800">{mould.typeOfMould}</td>
                                        <td className="px-6 py-3 text-gray-800">{mould.filledBy}</td>
                                    </tr>
                                ))}
                                {totalFiltered === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                                            No moulds found for this batch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mould Pagination Controls */}
                    {totalFiltered > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-semibold text-gray-700">{fromItem}–{toItem}</span> of{' '}
                                    <span className="font-semibold text-gray-700">{totalFiltered}</span> moulds
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        disabled={queryParams.page === 1}
                                        onClick={() => setQueryParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                                            queryParams.page === 1
                                                ? 'text-gray-300 bg-gray-100 border-gray-100 cursor-not-allowed'
                                                : 'text-teal-600 bg-white border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                                        }`}
                                    >
                                        Prev
                                    </button>

                                    {Array.from({ length: Math.ceil(totalFiltered / resultPerPage) }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setQueryParams(prev => ({ ...prev, page: pageNum }))}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                                                queryParams.page === pageNum
                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-100'
                                                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-800'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        disabled={queryParams.page === Math.ceil(totalFiltered / resultPerPage)}
                                        onClick={() => setQueryParams(prev => ({ ...prev, page: Math.min(Math.ceil(totalFiltered / resultPerPage), prev.page + 1) }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                                            queryParams.page === Math.ceil(totalFiltered / resultPerPage)
                                                ? 'text-gray-300 bg-gray-100 border-gray-100 cursor-not-allowed'
                                                : 'text-teal-600 bg-white border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Readings Table */}
                <div className="mt-6 bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Environment Readings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">S.No</th>
                                    <th className="px-6 py-3">Temperature (°C)</th>
                                    <th className="px-6 py-3">Humidity (%)</th>
                                    <th className="px-6 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {batchInfo.environmentReadings?.map((reading, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-3 text-gray-800">{reading.temperature}</td>
                                        <td className="px-6 py-3 text-gray-800">{reading.humidity}</td>
                                        <td className="px-6 py-3 text-gray-600">{convertToIST(reading.time)}</td>
                                    </tr>
                                ))}
                                {(!batchInfo.environmentReadings || batchInfo.environmentReadings.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                                            No readings recorded for this batch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Images */}
                {batchInfo.images && batchInfo.images.length > 0 && (
                    <div className="mt-6 bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Visual Records</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {batchInfo.images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => setActiveImage(image)}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                                    >
                                        <img
                                            src={image}
                                            alt={`Batch Image ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fullscreen Image Modal */}
                {activeImage && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300"
                        onClick={() => setActiveImage(null)}
                    >
                        {/* Close button */}
                        <button 
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all focus:outline-none"
                            onClick={() => setActiveImage(null)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div 
                            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={activeImage} 
                                alt="Zoomed Visual Record" 
                                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10 object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MFBatchDetail;

