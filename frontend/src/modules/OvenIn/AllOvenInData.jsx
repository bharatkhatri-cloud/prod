import React from 'react';
import Loader from '../../assets/Loader';
import FormatTime from '../../assets/FormatTime';
import { fetchOvenInData } from '../../reduxStore/OvenIn/OvenInSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AllOvenInData = () => {
    const [selectOven, setSelectOven] = React.useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ovenInState = useSelector((state) => state.ovenInReducer);
    const [oven, setOven] = React.useState([]);

    React.useEffect(() => {
        dispatch(fetchOvenInData());
    }, [dispatch]);

    React.useEffect(() => {
        if (ovenInState.data && ovenInState.data.ovenInData) {
            setOven(ovenInState.data.ovenInData);
        }
    }, [ovenInState.data]);

    const filteredOvens = selectOven
        ? oven.filter((item) => item.ovenSerialNo === selectOven)
        : oven;

    const uniqueOvens = [...new Set(oven.map((o) => o.ovenSerialNo))];

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
            <style>{`
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                .animate-loading-bar {
                    animation: loadingBar 1.2s infinite linear;
                }
            `}</style>

            {/* ── Header ── */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">
                        Heat Treatment
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Oven-In Data</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {filteredOvens.length} record{filteredOvens.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Filter by Oven
                    </label>
                    <select
                        value={selectOven}
                        onChange={(e) => setSelectOven(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                    >
                        <option value="">All Ovens</option>
                        {uniqueOvens.map((ovn) => (
                            <option key={ovn} value={ovn}>{ovn}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">S.No</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Oven No</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Batch ID</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Oven In Time</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Oven Out Time</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {/* Thin loading bar directly under the table header */}
                            <tr>
                                <td colSpan={6} className="p-0 border-0 h-0.5 relative overflow-hidden bg-transparent">
                                    {ovenInState.isLoading && (
                                        <div className="absolute inset-0 bg-orange-50">
                                            <div className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-loading-bar"></div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {!ovenInState.isLoading && filteredOvens.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                            {filteredOvens.map((currData, ind) => (
                                <tr key={currData._id} className="hover:bg-orange-50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-gray-400 font-medium">{ind + 1}</td>
                                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{currData.ovenSerialNo}</td>
                                    <td className="px-5 py-4 text-sm text-gray-700">{currData.batchIdOfOvenIn}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{FormatTime(currData.batchInTime)}</td>
                                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                                        {currData.batchOutTime
                                            ? <span className="text-gray-500">{FormatTime(currData.batchOutTime)}</span>
                                            : <span className="text-orange-500 font-medium">In Process…</span>
                                        }
                                    </td>
                                    <td className="px-5 py-4 text-sm text-right">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/ovenDataReport', { state: { oven: currData } })}
                                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {filteredOvens.length > 0 && (
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                        <span>Showing {filteredOvens.length} of {oven.length} records</span>
                        {selectOven && (
                            <button
                                onClick={() => setSelectOven('')}
                                className="text-orange-500 font-semibold hover:text-orange-700"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllOvenInData;
