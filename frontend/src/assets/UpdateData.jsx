import React, { useState, useRef, useEffect } from 'react';
import useUpdateModuleData from "../hooks/useUpdateModuleData";
import { useDispatch } from 'react-redux';

const UpdateData = ({ moduleData, url, isModalOpen, setIsModalOpen, inputModuleData, setInputModuleData,getDataAfterUpdate ,queryParams}) => {
    const dispatch = useDispatch();
    const { updateModulesData, loading } = useUpdateModuleData();

    const [keys, setKeys] = useState([...Object.keys(moduleData)]) //? keys is a array of keys (ex: ["lcId", "lcQty", "scId", "scQty"])
    const moduleEmptyObject = Object.fromEntries(keys.map(key => [key, ""])); //? moduleEmptyObject is object (ex: { lcId: "", lcQty: "", scId: "", scQty: "" }) 

    const handleInputModuleData = (key, value) => {
        const newData = { ...inputModuleData, [key]: value };
        setInputModuleData(newData);
    };

    const modalRef = useRef(null);
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
        }
    };
    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);


    const submitUpdatedModuleData = async (e) => {
        e.preventDefault();
        try {
            const res = await updateModulesData({ url, inputData: inputModuleData });
            if (res.success) {
                setInputModuleData(moduleEmptyObject)
                dispatch(getDataAfterUpdate(queryParams)) //? call function to get data after update
                console.log("getDataAfterUpdate");
                

            }
        } catch (error) {
            console.error("Update failed:", error.message);
        }


    };


    const cancel = () => {
        setIsModalOpen(false)
        setInputModuleData({ ...moduleEmptyObject })
    }

    return (
        <div className='mt-4'>

            {isModalOpen && (
                <div
                    id="authentication-modal"
                    tabIndex="-1"
                    aria-hidden="true"
                    className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
                >
                    <div ref={modalRef} className="relative p-4 w-full max-w-md max-h-full">
                        <div className="relative bg-teal rounded-lg shadow dark:bg-white">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-teal-600">
                                <h3 className="text-xl font-bold text-teal-900 dark:text-teal-700">
                                    Update Data
                                </h3>
                                <button
                                    type="button"
                                    className="text-teal-400 bg-transparent hover:bg-teal-200 hover:text-teal-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-teal-600 dark:hover:text-teal"
                                    onClick={() => setIsModalOpen(!isModalOpen)}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <div className="p-4 md:p-5">
                                <form className="space-y-4" onSubmit={submitUpdatedModuleData}>
                                    {keys.map((currItem) => (

                                        <div key={currItem}>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-teal-900 dark:text-teal"
                                            >
                                                {moduleData[`${currItem}`]}
                                            </label>
                                            <input
                                                type="text"
                                                value={inputModuleData[`${currItem}`]}
                                                name={currItem}
                                                onChange={(e) => handleInputModuleData(currItem, e.target.value)}
                                                id={currItem}
                                                className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                                placeholder={`Input ${moduleData[`${currItem}`]} `}
                                                required
                                            />
                                        </div>

                                    ))}
                                    <div className="flex mt-8">
                                        <button type="submit"
                                            className={`
                                            hover:text-white hover:bg-green-800 dark:hover:text-white
                                            text-green-700 border border-green-700 focus:ring-4 focus:outline-none focus:ring-green-300
                                            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500
                                            dark:text-green-500 
                                           `}
                                        >
                                            Update
                                        </button>
                                        <button type="button" onClick={() => cancel()} className="ml-2 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateData;


