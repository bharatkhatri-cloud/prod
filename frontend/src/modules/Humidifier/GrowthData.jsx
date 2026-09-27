import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import convertToIST from '../../assets/FormatTime';


const GrowthHumidifier = () => {
    const location = useLocation();
    const [humidifier, setHumidifier] = useState(location.state.humidifier)
    console.log("humidifier",humidifier.smFgData);
    

    return (
        <div>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center">Humidifier Details</h1>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <table className="table-auto w-full">
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Humidifier No</td>
                                <td className="border px-4 py-2">{humidifier.humidifierNo}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Batch Ids</td>
                                <td className="border px-4 py-2">{humidifier.batchId}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Mould Ids</td>
                                <td className="border px-4 py-2">{humidifier.smFgData.map((currData)=>{return currData.smFgId }).join(', ')}</td>
                            </tr>
                            {/* <tr>
                                <td className="border px-4 py-2 font-bold">Size</td>
                                <td className="border px-4 py-2">{humidifier.size}</td>
                            </tr> */}
                            <tr>
                                <td className="border px-4 py-2 font-bold">Placed By</td>
                                <td className="border px-4 py-2">{humidifier.placedBy}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Placing Time</td>
                                <td className="border px-4 py-2">{convertToIST(humidifier.placingTime)}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Readings</td>
                                <td className="border px-4 py-2" colSpan="2">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2">S. No.</th>
                                                <th className="border px-4 py-2">Temperature</th>
                                                <th className="border px-4 py-2">Humidity</th>
                                                <th className="border px-4 py-2">Time of Reading</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {humidifier.temperatureReading.sort().map((temp, index) => (
                                                <tr key={index}>
                                                    <td className="border px-4 py-2">{index + 1} </td>
                                                    <td className="border px-4 py-2">{temp}</td>
                                                    <td className="border px-4 py-2">{humidifier.humidityReading[index]}</td>
                                                    <td className="border px-4 py-2">{convertToIST(humidifier.readingTime[index])}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td className="border px-4 py-2 font-bold">Growth Type</td>
                                <td className="border px-4 py-2">{humidifier.growthType}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Images</td>
                                <td className="border px-4 py-2">
                                    {humidifier.images.map((image, index) => (
                                        <img key={index} src={image} alt={`Humidifier Image ${index + 1}`} className="w-48 h-auto mb-4" />
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default GrowthHumidifier
