import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllOvens } from '../../reduxStore/OvenIn/OvenSlice';

const Ovens = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allOvens = useSelector((state) => state.ovenReducer);
    const [allDataFromCollection, setGetAllDataFromCollection] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchAllOvens());
    }, [dispatch]);

    useEffect(() => {
        if (allOvens && Array.isArray(allOvens?.data?.oven)) {
            setGetAllDataFromCollection(allOvens.data.oven);
        } else {
            setGetAllDataFromCollection([]);
        }
    }, [allOvens]);

    const searchedOven = (Array.isArray(allDataFromCollection) ? allDataFromCollection : []).filter((currHum) =>
        (currHum?.serialNo || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

            {/* ── Header ── */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Heat Treatment</p>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Ovens</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchedOven?.length ?? 0} oven{searchedOven?.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search oven…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                    />
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {searchedOven?.map((oven) => (
                    <div
                        key={oven.serialNo}
                        className="relative bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col gap-4"
                    >
                        {/* Batch count badge */}
                        <div className="absolute top-4 right-4 min-w-[1.75rem] h-7 px-1.5 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-500">
                                {oven.batchInfoCount ?? 0}
                            </span>
                        </div>

                        {/* Icon + label */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                {/* Oven / fire icon */}
                                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Oven</p>
                                <p className="text-base font-bold text-gray-800 tracking-tight">{oven.serialNo}</p>
                            </div>
                        </div>

                        {/* Batch count info */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>
                                {/* {oven.batchInfoCount} */}
                                {/* {oven.batchInfo?.length ?? 0} active batch{(oven.batchInfo?.length ?? 0) !== 1 ? 'es' : ''} */}
                                {oven.batchInfoCount ?? 0} active batch{(oven.batchInfoCount ?? 0) !== 1 ? 'es' : ''}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Action */}
                        <button
                            type="button"
                            onClick={() => navigate(`/batches/${oven.serialNo}`, { state: { oven } })}
                            className="w-full py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Place Mould
                        </button>
                    </div>
                ))}

            </div>

            {/* Empty state */}
            {!searchedOven?.length && (
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="w-14 h-14 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base font-semibold">
                        {searchQuery ? `No ovens match "${searchQuery}"` : 'No ovens found'}
                    </p>
                    <p className="text-sm mt-1">
                        {searchQuery ? 'Try a different search term' : 'Check your connection and refresh'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Ovens;
