import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../assets/Loader';
import { fetchAddedMouldsData } from '../../reduxStore/GrowthChamber/HumidiferDataSlice';
import Pagination from '../../assets/Pagination';
import convertToIST from '../../assets/FormatTime';
import { useNavigate } from 'react-router-dom';

const EMPTY_FILTERS = {
    humidifierNo: '',
    batchId: '',
    placedBy: '',
    openedBy: '',
    minGrowthType: '',
    maxGrowthType: '',
    startDate: '',
    endDate: '',
    removedStartDate: '',
    removedEndDate: '',
    markAsFilledStartDate: '',
    markAsFilledEndDate: '',
    readingsFinishedStartDate: '',
    readingsFinishedEndDate: '',
};

const HumidifiersData = () => {
    const state = useSelector((state) => state.humidifierDataReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [resultPerPage, setResultPerPage] = useState(10);
    const [queryParams, setQueryParams] = useState({ page: 1, resultPerPage: 10 });

    const humidifierData = state?.data?.humidifiersData || [];
    const totalFiltered  = state?.data?.totalFiltered  || 0;

    const fetchData = useCallback((params) => {
        dispatch(fetchAddedMouldsData(params));
    }, [dispatch]);

    useEffect(() => {
        fetchData(queryParams);
    }, []);

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const applyFilters = () => {
        const active = {};
        Object.keys(filters).forEach((k) => {
            if (filters[k] !== '') active[k] = filters[k];
        });
        const newParams = { ...active, page: 1, resultPerPage };
        setQueryParams(newParams);
        fetchData(newParams);
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        const newParams = { page: 1, resultPerPage };
        setQueryParams(newParams);
        fetchData(newParams);
    };

    const handleResultPerPageChange = (e) => {
        const rpp = Number(e.target.value);
        setResultPerPage(rpp);
        const newParams = { ...queryParams, page: 1, resultPerPage: rpp };
        setQueryParams(newParams);
        fetchData(newParams);
    };

    return (
        <div className="flex flex-col p-4">
            <div className="text-center text-3xl font-bold mb-6">Growth Chamber Data</div>

            {/* ── Filter Panel ───────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>

                {/* Field filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Humidifier No</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="text" name="humidifierNo" value={filters.humidifierNo}
                            onChange={handleFilterChange} placeholder="e.g. H35"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Batch ID</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="text" name="batchId" value={filters.batchId}
                            onChange={handleFilterChange} placeholder="Batch ID"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Placed By</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="text" name="placedBy" value={filters.placedBy}
                            onChange={handleFilterChange} placeholder="Placed by"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Opened By</label>
                        <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            type="text" name="openedBy" value={filters.openedBy}
                            onChange={handleFilterChange} placeholder="Opened by"
                        />
                    </div>
                </div>

                {/* Growth type range */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
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

                {/* Date range filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Placing Time</p>
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
                        <p className="text-xs font-semibold text-gray-500 mb-2">Mark As Filled Time</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">From</label>
                                <input type="date" name="markAsFilledStartDate" value={filters.markAsFilledStartDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">To</label>
                                <input type="date" name="markAsFilledEndDate" value={filters.markAsFilledEndDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Readings Finished Time</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">From</label>
                                <input type="date" name="readingsFinishedStartDate" value={filters.readingsFinishedStartDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-400 mb-1">To</label>
                                <input type="date" name="readingsFinishedEndDate" value={filters.readingsFinishedEndDate}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Removed Time</p>
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

                {/* Action row */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                        onClick={applyFilters}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                    >
                        Clear
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                        <label className="text-sm text-gray-500">Rows per page:</label>
                        <select
                            value={resultPerPage}
                            onChange={handleResultPerPageChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        >
                            {[5, 10, 25, 50, 100].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div className="overflow-x-auto border rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">S.No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Humidifier No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Batch ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Placing Time</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Placed By</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Growth %</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Mark As Filled</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Readings Done</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Opened By</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border">Removed Time</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {state.isLoading && (
                            <tr>
                                <td colSpan={11} className="py-8 text-center">
                                    <Loader />
                                </td>
                            </tr>
                        )}
                        {!state.isLoading && humidifierData.length === 0 && (
                            <tr>
                                <td colSpan={11} className="py-8 text-center text-sm text-gray-400">
                                    No data found
                                </td>
                            </tr>
                        )}
                        {humidifierData.map((row, ind) => (
                            <tr key={row._id || ind} className="hover:bg-teal-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700 border text-center">{ind + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.humidifierNo}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.batchId}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border whitespace-nowrap">{convertToIST(row.placingTime)}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.placedBy}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border text-center">{row.growthType ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border whitespace-nowrap">{row.markAsFilledTime ? convertToIST(row.markAsFilledTime) : '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border whitespace-nowrap">{row.readingsFinishedTime ? convertToIST(row.readingsFinishedTime) : '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border">{row.openedBy ?? '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 border whitespace-nowrap">{row.removedTime ? convertToIST(row.removedTime) : '—'}</td>
                                <td className="px-4 py-3 text-sm border">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/growthData', { state: { humidifier: row } })}
                                        className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors"
                                    >
                                        More
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            <Pagination
                getData={fetchAddedMouldsData}
                totalData={totalFiltered}
                resultPerPage={resultPerPage}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
            />
        </div>
    );
};

export default HumidifiersData;
