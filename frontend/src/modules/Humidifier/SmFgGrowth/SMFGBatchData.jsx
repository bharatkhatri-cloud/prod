import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import { fetchSmfgBatchData } from '../../../reduxStore/Humidifier/SmfgBatchDataSlice';
import Pagination from '../../../assets/Pagination';
import convertToIST from '../../../assets/FormatTime';
import { useNavigate } from 'react-router-dom';

const EMPTY_FILTERS = {
    startDate: '',
    endDate: '',
    minGrowthType: '',
    maxGrowthType: '',
    typeOfMould: '',
    removedStartDate: '',
    removedEndDate: '',
};

const SMFGBatchData = () => {
    const state = useSelector((s) => s.smfgBatchDataReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [resultPerPage, setResultPerPage] = useState(10);
    const [queryParams, setQueryParams] = useState({ page: 1, resultPerPage: 10 });

    const allData = Array.isArray(state?.data) ? state.data : [];

    const fetchData = useCallback(() => {
        dispatch(fetchSmfgBatchData());
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const applyFilters = () => {
        setQueryParams({ ...queryParams, page: 1 });
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setQueryParams({ page: 1, resultPerPage: 10 });
    };

    const handleResultPerPageChange = (e) => {
        const rpp = Number(e.target.value);
        setResultPerPage(rpp);
        setQueryParams({ ...queryParams, page: 1, resultPerPage: rpp });
    };

    const filteredData = (Array.isArray(allData) ? allData : []).filter(row => {
        let isValid = true;
        if (filters.minGrowthType && (row.growthType === null || row.growthType < Number(filters.minGrowthType))) isValid = false;
        if (filters.maxGrowthType && (row.growthType === null || row.growthType > Number(filters.maxGrowthType))) isValid = false;
        if (filters.typeOfMould && row.typeOfMould && !row.typeOfMould.toLowerCase().includes(filters.typeOfMould.toLowerCase())) isValid = false;
        return isValid;
    });

    const totalFiltered = filteredData.length;
    const currentPage = queryParams.page;
    const fromItem = totalFiltered === 0 ? 0 : (currentPage - 1) * resultPerPage + 1;
    const currentItemCount = Math.min(resultPerPage, totalFiltered - fromItem + 1);
    const toItem = (currentPage - 1) * resultPerPage + currentItemCount;

    const mouldInfoData = filteredData.slice((currentPage - 1) * resultPerPage, currentPage * resultPerPage);

    return (
        <div className="flex flex-col p-4 bg-gray-50 min-h-screen">
            <div className="text-center text-3xl font-bold mb-6 text-gray-800">SMFG — Batch History</div>

            {/* Filter Panel */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Department</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="text" name="typeOfMould" value={filters.typeOfMould}
                            onChange={handleFilterChange} placeholder="e.g. SMFG"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Growth Type ≥</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="number" name="minGrowthType" value={filters.minGrowthType}
                            onChange={handleFilterChange} placeholder="Min %"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Growth Type ≤</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="number" name="maxGrowthType" value={filters.maxGrowthType}
                            onChange={handleFilterChange} placeholder="Max %"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Scan In Time</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">From</label>
                                <input type="date" name="startDate" value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">To</label>
                                <input type="date" name="endDate" value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Out Time</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">From</label>
                                <input type="date" name="removedStartDate" value={filters.removedStartDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">To</label>
                                <input type="date" name="removedEndDate" value={filters.removedEndDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button onClick={applyFilters} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">Apply Filters</button>
                    <button onClick={clearFilters} className="border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold px-5 py-2 rounded-lg text-sm transition-colors">Clear</button>
                    <div className="ml-auto flex items-center gap-2">
                        <label className="text-sm text-gray-500">Rows per page:</label>
                        <select value={resultPerPage} onChange={handleResultPerPageChange} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                            {[5, 10, 25, 50, 100].map(n => (<option key={n} value={n}>{n}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">S.No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Chamber No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Batch ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Scan In Time</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Out Time</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Growth %</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Department</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {state.isLoading && (
                            <tr><td colSpan={8} className="py-8 text-center"><Loader /></td></tr>
                        )}
                        {!state.isLoading && mouldInfoData.length === 0 && (
                            <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-400">No data found</td></tr>
                        )}
                        {mouldInfoData.map((row, ind) => (
                            <tr key={`${row.id}-${ind}`} className="hover:bg-teal-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700 border text-center">{ind + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.humidifierNo}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.batchId}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border whitespace-nowrap">{convertToIST(row.placingTime)}</td>
                                <td className="px-4 py-3 text-sm border whitespace-nowrap">
                                    {row.removedTime
                                        ? <span className="text-gray-700">{convertToIST(row.removedTime)}</span>
                                        : <span className="text-green-600 font-medium">Currently in Chamber</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 border text-center">{row.growthType ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.department ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border text-center">
                                    <button
                                        onClick={() => navigate('/smfg-growth/batch-detail', { state: { humidifier: row } })}
                                        className="text-teal-600 hover:text-teal-800 font-semibold"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!state.isLoading && totalFiltered > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 mt-3 px-1">
                    <span>
                        Showing <span className="font-semibold text-gray-700">{fromItem}–{toItem}</span> of{' '}
                        <span className="font-semibold text-gray-700">{totalFiltered}</span> items
                    </span>
                    <span className="bg-teal-50 border border-teal-200 text-teal-700 font-semibold px-3 py-1 rounded-lg">
                        {currentItemCount} on this page
                    </span>
                </div>
            )}

            <Pagination
                getData={() => {}}
                totalData={totalFiltered}
                resultPerPage={resultPerPage}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
            />
        </div>
    );
};

export default SMFGBatchData;
