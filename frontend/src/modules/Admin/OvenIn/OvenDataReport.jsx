import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import convertToIST from '../../../assets/FormatTime';


const OvenDataReport = () => {
    const location = useLocation();
    const [oven, setOven] = useState(location.state.oven)
    console.log("oven",oven);
    

    return (
        <div>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center">Oven Data Report</h1>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <table className="table-auto w-full">
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Oven No</td>
                                <td className="border px-4 py-2">{oven.ovenSerialNo}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Batch Id</td>
                                <td className="border px-4 py-2">{oven.batchIdOfOvenIn}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Oven Temperature</td>
                                <td className="border px-4 py-2">{oven.temp}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Placing Time</td>
                                <td className="border px-4 py-2">{convertToIST(oven.batchInTime)}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Out Time</td>
                                <td className="border px-4 py-2">{oven.batchOutTime ? convertToIST(oven.batchOutTime) : 'Still, in the heat treatment process...'}</td>
                            </tr>
                            <tr>

                                <td className="border px-4 py-2 font-bold">Pieces Ids</td>
                                <td className="border px-4 py-2">{oven.ovenInSemiFGIds.map((currData)=>{return currData.smFgId }).join(', ')}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">Total Pieces</td>
                                <td className="border px-4 py-2">{oven.ovenInSemiFGIds.length}</td>
                            </tr>                           
                            <tr>
                                <td className="border px-4 py-2 font-bold">Pieces Quality</td>
                                <td className="border px-4 py-2" colSpan="2">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2">S. No.</th>
                                                <th className="border px-4 py-2">Piece Id</th>
                                                <th className="border px-4 py-2">Quality</th>
                                                <th className="border px-4 py-2">In Time</th>
                                                <th className="border px-4 py-2">In By</th>
                                                <th className="border px-4 py-2">Out Time</th>
                                                <th className="border px-4 py-2">Out By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {oven.ovenInSemiFGIds.map((currItem, index) => (
                                                <tr key={index}>
                                                    <td className="border px-4 py-2">{index + 1} </td>
                                                    <td className="border px-4 py-2">{currItem.smFgId}</td>
                                                    <td className="border px-4 py-2">{currItem.quality}</td>
                                                    <td className="border px-4 py-2">{convertToIST(currItem.inTime)}</td>
                                                    <td className="border px-4 py-2">{currItem.inBy}</td>
                                                    <td className="border px-4 py-2">{convertToIST(currItem.outTime)}</td>
                                                    <td className="border px-4 py-2">{currItem.outBy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td className="border px-4 py-2 font-bold">T2</td>
                                <td className="border px-4 py-2">{oven.ovenInSemiFGIds.filter((currItem)=>currItem.quality === 'T2').length}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">TC</td>
                                <td className="border px-4 py-2">{oven.ovenInSemiFGIds.filter((currItem)=>currItem.quality === 'TC').length}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-bold">T3</td>
                                <td className="border px-4 py-2">{oven.ovenInSemiFGIds.filter((currItem)=>currItem.quality === 'T3').length}</td>
                            </tr>
                         
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OvenDataReport
