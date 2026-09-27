import React, { useEffect, useState } from 'react'
import HumidifierTopBar from './HumidifierTopBar'
import { useLocation } from 'react-router-dom'
import convertToIST from '../../../assets/FormatTime';
import { useSelector, useDispatch } from 'react-redux';
import { getAddedMouldsData } from '../../../reduxStore/Humidifier/HumidifierSlice'

const AdminHumidifierStatus = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const state = useSelector((state) => state.growthChamberReducer)
    const [humidifier, setHumidifier] = useState(location.state.humidifier)
    const [addedMouldData, setAddedMouldsData] = useState({});
    useEffect(() => {
        dispatch(getAddedMouldsData({ humidifier }))
    }, [dispatch])

    useEffect(() => {
        if (state && state.data && state.data.data) {
          setAddedMouldsData(state.data.data);
        }
      }, [state]);


    return (
        <>
            <HumidifierTopBar />
            <div>
                {console.log("humidifier",addedMouldData)}


                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">Humidifier "{humidifier.serialNo}"</h1>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <table className="table-auto w-full">
                            <tbody>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Humidifier No</td>
                                    <td className="border px-4 py-2">{humidifier.serialNo}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Batch Ids</td>
                                    <td className="border px-4 py-2">{addedMouldData.batchId}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Mould Ids</td>
                                    <td className="border px-4 py-2">{addedMouldData.moldIds?.join(', ')}</td>
                                </tr>

                                <tr>
                                    <td className="border px-4 py-2 font-bold">Placed By</td>
                                    <td className="border px-4 py-2">{addedMouldData.placedBy}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Placing Time</td>
                                    <td className="border px-4 py-2">{convertToIST(addedMouldData.placingTime)}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Readings</td>
                                    <td className="border px-4 py-2" colSpan="2">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="border px-4 py-2">S.No.</th>
                                                    <th className="border px-4 py-2">Temperature</th>
                                                    <th className="border px-4 py-2">Humidity</th>
                                                    <th className="border px-4 py-2">Time of Reading</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {addedMouldData?.temperatureReading?.map((temp, index) => (
                                                <tr key={index}>
                                                    <td className="border px-4 py-2">{index + 1 }</td>
                                                    <td className="border px-4 py-2">{temp}</td>
                                                    <td className="border px-4 py-2">{addedMouldData.humidityReading[index]}</td>
                                                    <td className="border px-4 py-2">{convertToIST(addedMouldData.readingTime[index])}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>



                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </>
    )
}

export default AdminHumidifierStatus

