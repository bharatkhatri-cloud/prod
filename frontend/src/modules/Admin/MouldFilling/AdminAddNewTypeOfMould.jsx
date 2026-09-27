import React, { useState } from 'react';
import { fetchToCreateNewTypeOfMould ,fetchToGetTypeOfMould} from '../../../reduxStore/MouldFilling/TypeOfMouldSlice'
import { useDispatch } from 'react-redux';
function AdminAddNewTypeOfMould() {
    const [modalOpen, setModalOpen] = useState(false);
    const dispatch = useDispatch()

    const [formData, setFormData] = useState({
        typeOfMould: ''
    });

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };
    const handleInputFormData = (key, value) => {
        setFormData({ [key]: value })
    }

    const handleSubmitFormData = async (e) => {
        e.preventDefault()
       const response = await dispatch(fetchToCreateNewTypeOfMould(formData)).unwrap();
        if(response.success) {
            dispatch(fetchToGetTypeOfMould())
            setFormData({
                typeOfMould: ''
            })
        }
    }


    return (
        <>
            <button
                onClick={toggleModal}
                className="ml-4 inline-flex items-center text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                type="button"
            >
                <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                Add New Type Of Mould
            </button>

            {modalOpen && (
                <div id="crud-modal" className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-gray-900 bg-opacity-50">
                    <div className="mx-2 relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-white-00">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-white-600">
                            <h3 className="text-lg font-semibold text-black-900 dark:text-black">
                                Add New Type Of Mould
                            </h3>
                            <button
                                type="button"
                                className="text-black-400 bg-transparent hover:bg-black-200 hover:text-black-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-black-600 dark:hover:text-black"
                                onClick={toggleModal}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        <form className="p-4 md:p-5" onSubmit={handleSubmitFormData}>
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                <div className="col-span-2">
                                    <label htmlFor="typeOfMould" className="block mb-2 text-sm font-medium text-black-900 dark:text-black">Enter Type Of Mould</label>
                                    <input
                                        type="text"
                                        name="typeOfMould"
                                        id="typeOfMould"
                                        className="bg-white-50 border border-white-300 text-black-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-black-600 dark:border-white-500 dark:placeholder-white-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder="Type 1"
                                        value={formData.typeOfMould}
                                        onChange={(e) => handleInputFormData(e.target.name, e.target.value)}
                                        required

                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add New Type
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}



export default AdminAddNewTypeOfMould


