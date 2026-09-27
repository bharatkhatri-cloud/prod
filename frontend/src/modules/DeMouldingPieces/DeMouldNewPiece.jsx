import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { fetchToDeMouldNewPiece } from '../../reduxStore/DeMouldingPieces/DeMouldingPieceSlice';

const DeMouldNewPiece = () => {
    const dispatch = useDispatch();
    const [deMouldedData, setDeMouldedData] = useState({
            mouldId: "",
            smFgId: "",
        });

    const handleInputDataOfDeMoulding = (key,value) => {
        setDeMouldedData({...deMouldedData, [key]: value});
    }
    const submitDeMouldedData = async (e) => {
        e.preventDefault();
        try {
            const res = await dispatch(fetchToDeMouldNewPiece(deMouldedData)).unwrap();
            if (res.success) {
                setDeMouldedData({
                    mouldId: "",
                    smFgId: "",
                });
            }
        } catch (error) {
            console.log(error);
        }
    }


    const clearAll = async () => {
        setDeMouldedData({
            mouldId: "",
            smFgId: "",
        });
    };

    return (
        <>
            <form onSubmit={submitDeMouldedData} className="max-w-sm bg-white-50 p-4 sm:mx-auto mx-4 my-4 rounded-lg shadow-lg justify-center">
                <label htmlFor="mouldId" className="block mt-2 text-sm font-medium text-teal-900">
                    Scan Mould ID:
                </label>
                <input
                    type="text" id="mouldId" value={deMouldedData.mouldId} name="mouldId"
                    onChange={(e) => handleInputDataOfDeMoulding(e.target.name, e.target.value)}
                    className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
                    placeholder="Input Mould ID"
                    required
                />

                <label htmlFor="smFgId" className="block mt-2 text-sm font-medium text-teal-900">
                    Scan Piece ID:
                </label>
                <input
                    type="text" id="smFgId" value={deMouldedData.smFgId} name="smFgId"
                    onChange={(e) => handleInputDataOfDeMoulding(e.target.name, e.target.value)}
                    className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
                    placeholder="Input Bag ID"
                    required
                />
                <div className='py-4'>
                    
                    <button
                        type="submit"
                        className="mr-2 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        Submit
                    </button>

                    <button
                        type="button"
                        onClick={() => clearAll()}
                        className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        Clear All
                    </button>
                
                </div>
            </form>

          
        </>
    );


}

export default DeMouldNewPiece
