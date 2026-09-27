import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import { fetchFgData } from '../../../reduxStore/OvenIn/FgDataSlice';

const AdminDataOfFgData = ({ queryParams }) => {
    const state = useSelector((state) => state.fgDataReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [fgDataList, setFgDataList] = useState([]);

    useEffect(() => {
        dispatch(fetchFgData());
    }, [dispatch]);

    useEffect(() => {
        if (state?.data?.fgDataList) {
            setFgDataList(state.data.fgDataList);
        }
    }, [state]);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block">
                    <div className="border rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">FG ID</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Batch ID</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">SmFG ID</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Type of Mould</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Mould ID</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Quality</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Oven In Time</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Oven Out Time</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Out By</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Filled By</th>
                                    <th className="px-4 py-4 text-sm font-medium text-gray-500 uppercase border">Filling Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {state.isLoading && (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-4 text-sm text-gray-800 text-center">
                                            <Loader />
                                        </td>
                                    </tr>
                                )}

                                {!state.isLoading && fgDataList.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-4 text-sm text-gray-500 text-center">
                                            No data found.
                                        </td>
                                    </tr>
                                )}

                                {fgDataList.map((item, index) => (
                                    <tr className="hover:bg-teal-50" key={item.id || index}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border font-mono">{item.fgId}</td>

                                        {/* Batch ID — each ID is a clickable link */}
                                        <td className="px-4 py-3 text-sm border">
                                            {item.batchIds && item.batchIds.length > 0
                                                ? item.batchIds.map((bid, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => navigate(`/batch/get-report/${bid}`)}
                                                        className="block text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs whitespace-nowrap"
                                                    >
                                                        {bid}
                                                    </button>
                                                ))
                                                : <span className="text-gray-400">—</span>}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border font-mono">{item.smFgId || '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm border">
                                            {item.typeOfMould
                                                ? <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded">{item.typeOfMould}</span>
                                                : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{item.mouldId || '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm border">
                                            {item.quality
                                                ? <span className={`text-xs font-semibold px-2 py-0.5 rounded ${item.quality === 'N/D' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>{item.quality}</span>
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(item.inTime)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{item.outTime ? FormatTime(item.outTime) : '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{item.outBy || '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{item.filledBy || '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border">{item.fillingDate ? FormatTime(item.fillingDate) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDataOfFgData;
