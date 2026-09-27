import React from 'react'
import FormatTime from '../../assets/FormatTime';

const ReadingsData = ({ addedMouldData, removeReading }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Readings</h3>
                <p className="text-sm text-gray-500">Recorded data for this batch</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">No.</th>
                            <th className="px-6 py-4">Temp (°C)</th>
                            <th className="px-6 py-4">Humidity (%)</th>
                            <th className="px-6 py-4">Time</th>
                            {removeReading && <th className="px-6 py-4 text-right">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {addedMouldData && addedMouldData.temperatureReading && [...addedMouldData.temperatureReading].map((temp, ind) => {
                            return (
                                <tr className='group hover:bg-gray-50 transition-colors' key={ind}>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{ind + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800 font-bold">{temp}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800 font-bold">{addedMouldData.humidityReading[ind]}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{FormatTime(addedMouldData.readingTime[ind])}</td>
                                    {removeReading && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeReading(ind)}
                                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                        {!addedMouldData?.temperatureReading?.length && (
                            <tr>
                                <td colSpan={removeReading ? "5" : "4"} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No readings recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ReadingsData
