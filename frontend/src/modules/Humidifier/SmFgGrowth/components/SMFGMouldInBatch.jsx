import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSmfgMouldsByBatch, clearSmfgBatchData } from '../../../../reduxStore/Humidifier/SmFgGrowthSlice';
import 'react-toastify/dist/ReactToastify.css';

const SMFGMouldInBatch = ({ dataId, refreshKey, readOnly = false, onCountChange }) => {
    const dispatch = useDispatch();
    const mouldsByBatch = useSelector((state) => state.smFgGrowthReducer.mouldsByBatch);

    useEffect(() => {
        if (dataId) {
            dispatch(fetchSmfgMouldsByBatch(dataId));
        } else {
            dispatch(clearSmfgBatchData());
        }
    }, [dataId, refreshKey, dispatch]);

    useEffect(() => {
        if (onCountChange && mouldsByBatch) {
            onCountChange(mouldsByBatch.length);
        }
    }, [mouldsByBatch, onCountChange]);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = mouldsByBatch?.filter(item => {
        const mouldId = item.smFgId || item.mouldId || '';
        const typeOfMould = item.prevStationInfo?.typeOfMould || item.typeOfMould || '';
        return mouldId.toLowerCase().includes(searchQuery.toLowerCase()) ||
               typeOfMould.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

    const getScanInTime = (item) => {
        const history = item.smfgTransferHistory || item.mouldTransferHistory;
        if (history) {
            const record = history.find(r => r.batchId === dataId);
            if (record && record.scanInTime) {
                const date = new Date(record.scanInTime);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                const hoursStr = String(hours).padStart(2, '0');
                return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
            }
        }
        return 'N/A';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Placed Pieces</h3>
                    <p className="text-sm text-gray-500">Total items: {filteredData.length}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                             type="text"
                             className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all"
                             placeholder="Search..."
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4">S.No.</th>
                            <th scope="col" className="px-6 py-4">Piece ID</th>
                            <th scope="col" className="px-6 py-4">Type of Mould</th>
                            <th scope="col" className="px-6 py-4">Scan In Time</th>
                            {!readOnly && <th scope="col" className="px-6 py-4 text-right">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {[...filteredData].reverse().map((currItem, index) => (
                            <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{filteredData.length - index}</td>
                                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{currItem.smFgId || currItem.mouldId}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{currItem.prevStationInfo?.typeOfMould || currItem.typeOfMould || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{getScanInTime(currItem)}</td>
                                {!readOnly && (
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Remove</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {!filteredData.length && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm">
                                    {searchQuery ? 'No pieces match your search.' : 'No pieces placed yet. Scan items above to add them.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SMFGMouldInBatch;
