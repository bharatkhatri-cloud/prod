import React, { useState, useEffect } from 'react';
import convertToIST from '../../../../assets/FormatTime';
import { toast } from 'react-toastify';
import { fetchBatchReadings, deleteBatchReading } from '../api/smFgGrowthApis';

const SMFGReadingsTable = ({ batchId, refreshTrigger }) => {
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    useEffect(() => {
        if (!batchId) return;

        const loadReadings = async () => {
            setLoading(true);
            try {
                const response = await fetchBatchReadings(batchId);
                if (response.ok) {
                    const data = await response.json();
                    setReadings(data.reverse());
                }
            } catch (error) {
                console.error("Error fetching readings", error);
            } finally {
                setLoading(false);
            }
        };

        loadReadings();
    }, [batchId, refreshTrigger, localRefresh]);

    const handleDeleteReading = async (timestampStr) => {
        if (!window.confirm("Are you sure you want to delete this reading?")) return;
        try {
            const timestamp = new Date(timestampStr).getTime();
            const response = await deleteBatchReading(batchId, timestamp);
            if (response.ok) {
                toast.success("Reading deleted successfully");
                setLocalRefresh(prev => prev + 1);
            } else {
                const errorText = await response.text();
                toast.error(errorText || "Failed to delete reading");
            }
        } catch (error) {
            console.error("Error deleting reading", error);
            toast.error("Network error while deleting reading");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Reading History</h3>
                {loading && <span className="text-xs text-blue-500">Refreshing...</span>}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3">Cycle #</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Temperature (°C)</th>
                            <th className="px-6 py-3">Humidity (%)</th>
                            <th className="px-6 py-3">Taken By</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {readings.map((reading, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-500">{reading.duringWhichCycle !== null ? reading.duringWhichCycle : 'N/A'}</td>
                                <td className="px-6 py-3 font-medium">{convertToIST(reading.time)}</td>
                                <td className="px-6 py-3">{reading.temperature}</td>
                                <td className="px-6 py-3">{reading.humidity}</td>
                                <td className="px-6 py-3 text-gray-500">{reading.takenBy}</td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => handleDeleteReading(reading.time)}
                                        className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {readings.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No readings recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SMFGReadingsTable;
