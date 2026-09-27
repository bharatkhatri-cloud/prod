import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import FormatTime from '../../assets/FormatTime';
import { fetchAllOvenOutData } from '../../reduxStore/OvenOut/OvenOutSlice';

const DataOfOvenOut = () => {
    const state = useSelector((state) => state.ovenOutReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filter states
    const [fgIdFilter, setFgIdFilter] = useState('');
    const [typeOfMouldFilter, setTypeOfMouldFilter] = useState('');
    const [qualityFilter, setQualityFilter] = useState('');
    const [outByFilter, setOutByFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [triggerFetch, setTriggerFetch] = useState(0);

    useEffect(() => {
        const params = {
            page,
            limit,
        };
        if (fgIdFilter.trim()) params.smFgId = fgIdFilter.trim();
        if (typeOfMouldFilter.trim()) params.typeOfMould = typeOfMouldFilter.trim();
        if (qualityFilter) params.quality = qualityFilter;
        if (outByFilter.trim()) params.outBy = outByFilter.trim();
        if (startDateFilter) params.startDate = startDateFilter;
        if (endDateFilter) params.endDate = endDateFilter;

        dispatch(fetchAllOvenOutData(params));
    }, [dispatch, page, limit, triggerFetch]);

    useEffect(() => {
        if (state && state.data) {
            setGetAllDataFromCollection(state.data.ovenOutData || []);
            setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0);
            setTotalPages(state.data.totalPages || 1);
        }
    }, [state]);

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

    const inputClass =
        'px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white w-full';
    const labelClass = 'text-[11px] font-bold text-gray-500 uppercase tracking-wider';

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

            {/* ── Header ── */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
                        Oven Out
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Oven-Out Data</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {totalNumberOfDataFetched || 0} Finished Good record{totalNumberOfDataFetched !== 1 ? 's' : ''} listed
                    </p>
                </div>
            </div>

            {/* ── Filters ── */}
            <form onSubmit={handleSearch} className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-md p-6 space-y-5 mb-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filters &amp; Queries</h2>
                    </div>
                    <button type="button" onClick={handleClearFilters} className="text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors">
                        Reset Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>FG ID</label>
                        <input type="text" placeholder="e.g. M787878" value={fgIdFilter} onChange={(e) => setFgIdFilter(e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Type of Mould</label>
                        <input type="text" placeholder="e.g. T20" value={typeOfMouldFilter} onChange={(e) => setTypeOfMouldFilter(e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Quality</label>
                        <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} className={inputClass}>
                            <option value="">All</option>
                            <option value="T2">T2</option>
                            <option value="TC">TC</option>
                            <option value="T3">T3</option>
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
                    <div className="flex items-end col-span-1 sm:col-span-2 justify-end">
                        <button type="submit" className="w-full py-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>
                    </div>
                </div>
            </form>

            {/* ── Table Card ── */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">S.No</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">FG ID</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">Type of Mould</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">Type of FG</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">Out Time</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">Out By</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left border-r border-gray-100/50">Oven No</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Oven In Batch ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {state.isLoading && (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <Loader />
                                    </td>
                                </tr>
                            )}
                            {!state.isLoading && getAllDataFromCollection.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                                        No finished goods records found.
                                    </td>
                                </tr>
                            )}
                            {!state.isLoading && getAllDataFromCollection.map((currData, index) => {
                                const seq = (page - 1) * limit + index + 1;
                                return (
                                    <tr key={currData.id || index} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-5 py-4 text-sm text-gray-400 font-medium border-r border-gray-100/50">{seq}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-800 border-r border-gray-100/50">{currData?.smFgId}</td>
                                        <td className="px-5 py-4 text-sm border-r border-gray-100/50">
                                            {currData?.typeOfMould ? (
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                                    {currData.typeOfMould}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm border-r border-gray-100/50">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                currData?.quality === 'T2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                currData?.quality === 'TC' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                currData?.quality === 'T3' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}>
                                                {currData?.quality || 'N/D'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap border-r border-gray-100/50">{FormatTime(currData?.outTime)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 border-r border-gray-100/50">{currData?.outBy || '—'}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-700 border-r border-gray-100/50">{currData?.ovenSerialNo || '—'}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{currData?.batchIdOfOvenIn || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                {totalNumberOfDataFetched > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        {/* Show records limit dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Show</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs font-bold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="font-semibold text-gray-400">per page</span>
                        </div>

                        {/* Mid-info text */}
                        <div className="font-medium">
                            Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                            <span className="font-bold text-gray-800">{Math.min(page * limit, totalNumberOfDataFetched)}</span> of{' '}
                            <span className="font-bold text-gray-800">{totalNumberOfDataFetched}</span> records
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-semibold text-blue-600">Oven-Out Collection</span>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${page === 1 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-blue-600'}`}
                            >
                                Previous
                            </button>

                            <div className="font-semibold text-gray-700">
                                Page {page} of {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${page === totalPages ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-blue-600'}`}
                            >
                                Next
                            </button>

                            <span className="text-gray-300">|</span>

                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">Go to Page:</span>
                                <input
                                    className="w-12 px-1.5 py-1 border border-gray-200 rounded-lg font-bold bg-white text-center text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={page}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (val >= 1 && val <= totalPages) {
                                            setPage(val);
                                        }
                                    }}
                                />
                                <span className="text-gray-400">of {totalPages}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default DataOfOvenOut;
