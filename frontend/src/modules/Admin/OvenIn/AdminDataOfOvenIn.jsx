import React from 'react';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import { fetchOvenInData } from '../../../reduxStore/OvenIn/OvenInSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminDataOfOvenin = () => {
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

    const handleChange = (e) => {
        setSelectOven(e.target.value);
    };

    const safeOven = Array.isArray(oven) ? oven : [];
    const filteredOvens = selectOven 
        ? safeOven.filter(item => item?.ovenSerialNo === selectOven)
        : safeOven;

        console.log("oven",oven);
        console.log("ovenInState",ovenInState);
        
    return (
        <>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className='text-center text-3xl font-bold m-4'>Oven-In Data</div>
                    <div className='flex flex-row justify-end mr-8'>
                        <div className='flex flex-col m-2 p-2'>
                            <div className='text-xl font-bold m-2'>Select Oven</div>
                            <div>
                                <select
                                    className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                    value={selectOven}
                                    onChange={handleChange}
                                >
                                    <option value="">All</option>
                                    {
                                        ovenInState.data?.ovenInData?.map((ovn) => {
                                            return (
                                                <option key={ovn._id} value={ovn.ovenSerialNo}>
                                                    {ovn.ovenSerialNo}
                                                </option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-1.5 min-w-full inline-block">
                        <div className="border rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border">S.No</th>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border">Oven No</th>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border">Batch IDs</th>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border">Oven In time</th>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border">Oven Out time</th>
                                        <th className="py-6 text-sm font-medium text-gray-500 uppercase border"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ovenInState.isLoading && 
                                        <tr>
                                            <td colSpan={'6'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                                                <Loader />
                                            </td>
                                        </tr>
                                    }

                                    {filteredOvens.map((currData, ind) => (
                                        <tr key={currData._id} className='hover:bg-teal-300'>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 border">{ind + 1}.</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 border">{currData.ovenSerialNo}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 border">{currData.batchIdOfOvenIn}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 border">{FormatTime(currData.batchInTime)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 border">{currData.ovenOutTime || 'Still, in the heat treatment process...'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border"><button type="button" onClick={() => {
                                                navigate('/admin/ovenDataReport', { state: { oven: currData } })
                                            }} className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 mb-2 " >More</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDataOfOvenin;
