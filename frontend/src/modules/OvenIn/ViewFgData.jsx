import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormatTime from '../../assets/FormatTime';
import Loader from '../../assets/Loader';

const ViewFgData = () => {
    const navigate = useNavigate();
    const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';

    const [fgDataList, setFgDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [triggerFetch, setTriggerFetch] = useState(0);

    // Filter states
    const [fgIdFilter, setFgIdFilter] = useState('');
    const [typeOfMouldFilter, setTypeOfMouldFilter] = useState('');
    const [qualityFilter, setQualityFilter] = useState('');
    const [outByFilter, setOutByFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const fetchFgData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (fgIdFilter.trim()) queryParams.append('fgId', fgIdFilter.trim());
            if (typeOfMouldFilter.trim()) queryParams.append('typeOfMould', typeOfMouldFilter.trim());
            if (qualityFilter) queryParams.append('quality', qualityFilter);
            if (outByFilter.trim()) queryParams.append('outBy', outByFilter.trim());
            if (startDateFilter) queryParams.append('startDate', startDateFilter);
            if (endDateFilter) queryParams.append('endDate', endDateFilter);

            const url = `${BACK_HOST}api/v2s/oven-in/fg-data?${queryParams.toString()}`;
            const response = await fetch(url, { method: 'GET', credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setFgDataList(data.fgDataList || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
            } else {
                console.error('Failed to fetch FG data.');
            }
        } catch (error) {
            console.error('Error fetching FG data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFgData();
    }, [page, limit, triggerFetch]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setTriggerFetch((prev) => prev + 1);
    };

    const handleClearFilters = () => {
        setFgIdFilter('');
        setTypeOfMouldFilter('');
        setQualityFilter('');
        setOutByFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
        setPage(1);
        setTriggerFetch((prev) => prev + 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };

    const inputClass =
        'px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50 hover:bg-white';
    const labelClass = 'text-[11px] font-bold text-gray-500 uppercase tracking-wider';

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(249,115,22,0.4); }
                    50% { box-shadow: 0 0 15px rgba(249,115,22,0.7); }
                }
                .glow-active { animation: pulse-glow 2s infinite; }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                                Finished Goods
                            </p>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">FG Data</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Browse all finished goods pieces with mould-filling linkage.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Records</span>
                            <span className="text-xl font-extrabold text-gray-800">{totalCount}</span>
                        </div>
                        <div className="bg-orange-50/60 px-4 py-2.5 rounded-2xl border border-orange-100 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">This Page</span>
                            <span className="text-xl font-extrabold text-orange-600">{fgDataList.length}</span>
                        </div>
                    </div>
                </div>

                {/* ── Filters ── */}
                <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filters &amp; Queries</h2>
                        </div>
                        <button type="button" onClick={handleClearFilters} className="text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors">
                            Reset Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>FG ID</label>
                            <input type="text" placeholder="e.g. FG-001" value={fgIdFilter} onChange={(e) => setFgIdFilter(e.target.value)} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Type of Mould</label>
                            <input type="text" placeholder="e.g. T600" value={typeOfMouldFilter} onChange={(e) => setTypeOfMouldFilter(e.target.value)} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Quality</label>
                            <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} className={inputClass}>
                                <option value="">All</option>
                                <option value="T2">T2</option>
                                <option value="TC">TC</option>
                                <option value="T3">T3</option>
                                <option value="N/D">N/D</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Out By</label>
                            <input type="text" placeholder="Operator name" value={outByFilter} onChange={(e) => setOutByFilter(e.target.value)} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Start Date</label>
                            <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>End Date</label>
                            <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className={inputClass} />
                        </div>
                        <div className="flex items-end col-span-1 sm:col-span-2 lg:col-span-2 justify-end">
                            <button type="submit" className="w-full py-2 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── Table ── */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/75">
                                <tr>
                                    {['S.No', 'FG ID', 'Batch ID', 'SmFG ID', 'Type of Mould', 'Mould ID', 'Quality', 'Oven In Time', 'Oven Out Time', 'Out By', 'Filled By'].map((h) => (
                                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading && (
                                    <tr>
                                        <td colSpan={11} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader />
                                                <span className="text-sm font-semibold text-gray-500">Fetching FG records…</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && fgDataList.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="py-20 text-center text-sm text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>No FG records found. Try clearing filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && fgDataList.map((item, ind) => {
                                    const seq = (page - 1) * limit + ind + 1;
                                    return (
                                        <tr key={item.id || ind} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="px-5 py-4 text-sm text-gray-400 font-medium">{seq}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-gray-800 font-mono whitespace-nowrap">{item.fgId}</td>

                                            {/* Batch IDs — each clickable */}
                                            <td className="px-5 py-4 text-sm">
                                                {item.batchIds && item.batchIds.length > 0
                                                    ? item.batchIds.map((bid, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => navigate(`/batch/get-report/${bid}`)}
                                                            className="block font-mono text-xs font-semibold text-orange-600 hover:text-orange-800 hover:underline whitespace-nowrap"
                                                        >
                                                            {bid}
                                                        </button>
                                                    ))
                                                    : <span className="text-gray-400">—</span>}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-mono text-gray-600 whitespace-nowrap">{item.smFgId || '—'}</td>

                                            <td className="px-5 py-4 text-sm">
                                                {item.typeOfMould
                                                    ? <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">{item.typeOfMould}</span>
                                                    : <span className="text-gray-400">—</span>}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{item.mouldId || '—'}</td>

                                            <td className="px-5 py-4 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    item.quality === 'T2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    item.quality === 'TC' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.quality === 'T3' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    'bg-gray-50 text-gray-500 border-gray-200'
                                                }`}>
                                                    {item.quality || 'N/D'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{FormatTime(item.inTime)}</td>
                                            <td className="px-5 py-4 text-xs whitespace-nowrap">
                                                {item.outTime
                                                    ? <span className="text-gray-500">{FormatTime(item.outTime)}</span>
                                                    : <span className="text-orange-500 font-medium italic">In Process…</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{item.outBy || '—'}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{item.filledBy || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalCount > 0 && (
                        <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">Show</span>
                                <select
                                    value={limit}
                                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-xs font-semibold text-gray-400">per page</span>
                            </div>

                            <div className="text-xs text-gray-500 font-medium">
                                Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                                <span className="font-bold text-gray-800">{Math.min(page * limit, totalCount)}</span> of{' '}
                                <span className="font-bold text-gray-800">{totalCount}</span> records
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${page === 1 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-orange-500'}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .map((p, index, array) => {
                                        const showDots = index > 0 && p - array[index - 1] > 1;
                                        return (
                                            <React.Fragment key={p}>
                                                {showDots && <span className="px-2 text-xs text-gray-400">...</span>}
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(p)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-orange-500 text-white border border-orange-500 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-orange-500'}`}
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
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${page === totalPages ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-orange-500'}`}
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

export default ViewFgData;