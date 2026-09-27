import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormatTime from '../../assets/FormatTime';
import Loader from '../../assets/Loader';

const ViewDataOfOvenIn = () => {
    const navigate = useNavigate();
    const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';

    // State for batches data
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [batchIdFilter, setBatchIdFilter] = useState('');
    const [ovenSerialFilter, setOvenSerialFilter] = useState('');
    const [tempFilter, setTempFilter] = useState('');
    const [operatorFilter, setOperatorFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Trigger state to manually force reload
    const [triggerFetch, setTriggerFetch] = useState(0);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (batchIdFilter.trim()) queryParams.append('batchId', batchIdFilter.trim());
            if (ovenSerialFilter.trim()) queryParams.append('ovenSerialNo', ovenSerialFilter.trim());
            if (tempFilter.trim()) queryParams.append('temp', tempFilter.trim());
            if (operatorFilter.trim()) queryParams.append('batchInBy', operatorFilter.trim());
            if (statusFilter) queryParams.append('status', statusFilter);
            if (startDateFilter) queryParams.append('startDate', startDateFilter);
            if (endDateFilter) queryParams.append('endDate', endDateFilter);

            const url = `${BACK_HOST}api/v2s/oven-in/batches?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
            } else {
                console.error("Failed to fetch oven batches.");
            }
        } catch (error) {
            console.error("Error while fetching batches: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when page, limit or trigger changes
    useEffect(() => {
        fetchBatches();
    }, [page, limit, triggerFetch]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        setTriggerFetch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setBatchIdFilter('');
        setOvenSerialFilter('');
        setTempFilter('');
        setOperatorFilter('');
        setStatusFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
        setPage(1);
        setTriggerFetch(prev => prev + 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(249, 115, 22, 0.4); }
                    50% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.7); }
                }
                .glow-active {
                    animation: pulse-glow 2s infinite;
                }
                .glassmorphism {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ── Header Area ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                                Heat Treatment Log
                            </p>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Oven Placement Batches</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and track all historical and live active batches inside baking ovens.
                        </p>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Records</span>
                            <span className="text-xl font-extrabold text-gray-800">{totalCount}</span>
                        </div>
                        <div className="bg-orange-50/60 px-4 py-2.5 rounded-2xl border border-orange-100 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Active Batches</span>
                            <span className="text-xl font-extrabold text-orange-600">
                                {batches.filter(b => !b.batchOutTime).length} <span className="text-xs font-normal text-gray-400">on page</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Advanced Search & Filters Panel ── */}
                <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filters & Queries</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                        >
                            Reset Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Batch ID */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Batch ID</label>
                            <input
                                type="text"
                                placeholder="e.g. OVN2D3105"
                                value={batchIdFilter}
                                onChange={(e) => setBatchIdFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Oven Serial */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Oven Serial No</label>
                            <input
                                type="text"
                                placeholder="e.g. OVN2"
                                value={ovenSerialFilter}
                                onChange={(e) => setOvenSerialFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Temp */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Temperature (°C)</label>
                            <input
                                type="text"
                                placeholder="e.g. 88"
                                value={tempFilter}
                                onChange={(e) => setTempFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Operator */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Operator (Placed By)</label>
                            <input
                                type="text"
                                placeholder="Operator name"
                                value={operatorFilter}
                                onChange={(e) => setOperatorFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active (In Treatment)</option>
                                <option value="completed">Completed (Out of Oven)</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* End Date */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                            <input
                                type="date"
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Search Button Container */}
                        <div className="flex items-end justify-end h-full">
                            <button
                                type="submit"
                                className="w-full py-2 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search Logs
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── Table Container ── */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/75">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Oven No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Batch ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Temperature</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">In Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Out Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Placed By</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading && (
                                    <tr>
                                        <td colSpan={9} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader />
                                                <span className="text-sm font-semibold text-gray-500">Querying treatment records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && batches.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-20 text-center text-sm text-gray-400 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>No matching batches found. Try clearing filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && batches.map((currData, ind) => {
                                    const sequence = (page - 1) * limit + ind + 1;
                                    const isActive = !currData.batchOutTime;

                                    return (
                                        <tr 
                                            key={currData.id || currData._id} 
                                            className="hover:bg-orange-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-400 font-medium">
                                                {sequence}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-gray-800">
                                                {currData.ovenSerialNo}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap font-semibold text-gray-700 font-mono text-xs bg-gray-50 group-hover:bg-white border border-gray-150 py-0.5 rounded-lg inline-block">
                                                {currData.batchIdOfOvenIn}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-orange-600/90">
                                                {currData.temp ? `${currData.temp}°C` : '—'}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500">
                                                {FormatTime(currData.batchInTime)}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500">
                                                {currData.batchOutTime ? (
                                                    FormatTime(currData.batchOutTime)
                                                ) : (
                                                    <span className="text-gray-400 font-medium italic">treatment in progress</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-600">
                                                {currData.batchInBy || '—'}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/80 glow-active">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                                        Baking
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/batch/get-report/${currData.batchIdOfOvenIn}`, { state: { oven: currData } })}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-orange-600 border border-orange-200 hover:bg-orange-600 hover:text-white shadow-sm hover:shadow-orange-500/10 transition-all transform hover:-translate-y-0.5"
                                                >
                                                    View Report
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Custom Pagination Controls ── */}
                    {totalCount > 0 && (
                        <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Page size controller */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">Show</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                >
                                    <option value={5}>5 batches</option>
                                    <option value={10}>10 batches</option>
                                    <option value={20}>20 batches</option>
                                    <option value={50}>50 batches</option>
                                    <option value={100}>100 batches</option>
                                </select>
                                <span className="text-xs font-semibold text-gray-400">per page</span>
                            </div>

                            {/* Details text */}
                            <div className="text-xs text-gray-500 font-medium">
                                Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                                <span className="font-bold text-gray-800">
                                    {Math.min(page * limit, totalCount)}
                                </span>{' '}
                                of <span className="font-bold text-gray-800">{totalCount}</span> logs
                            </div>

                            {/* Paginator controls */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                                        page === 1
                                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-orange-500'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Number Buttons */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .map((p, index, array) => {
                                        const showDots = index > 0 && p - array[index - 1] > 1;
                                        return (
                                            <React.Fragment key={p}>
                                                {showDots && (
                                                    <span className="px-2 text-xs text-gray-400">...</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(p)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        page === p
                                                            ? 'bg-orange-500 text-white border border-orange-500 shadow-sm'
                                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-orange-500'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={() => handlePageChange(page + 1)}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                                        page === totalPages
                                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-orange-500'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ViewDataOfOvenIn;
