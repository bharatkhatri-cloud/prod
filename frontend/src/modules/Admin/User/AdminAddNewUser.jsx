import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { fetchToCreateNewUser, fetchToGetAllUser } from '../../../reduxStore/authentication/userAuthSlice';


const AddNewUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const [createButtonDisable, setCreateButtonDisable] = useState(true);
    const [inputUserData, setInputUserData] = useState({
        name: "",
        email: "",
        role: "",
        password: "",
        cfmPassword: ""
    });

    const handleInputUserData = (key, value) => {
        const newData = { ...inputUserData, [key]: value };
        setInputUserData(newData);
        validateForm(newData);
    };

    const validateForm = (data) => {
        const { name, email, role, password, cfmPassword } = data;
        if (name && email && role && password && cfmPassword && password === cfmPassword) {
            setCreateButtonDisable(false);
        } else {
            setCreateButtonDisable(true);
        }
    };


    const dispatch = useDispatch();

    const submitNewUserDetails = async (e) => {
        e.preventDefault();
        try {
            await dispatch(fetchToCreateNewUser(inputUserData));
            await dispatch(fetchToGetAllUser());
            setInputUserData({
                name: "",
                email: "",
                role: "",
                password: "",
                cfmPassword: ""
            });
        } catch (error) {
            console.error("User not created:", error);
        }
    };
    

    const cancel = ()=>{
        setIsModalOpen(false)
        setInputUserData({
            name: "",
            email: "",
            role: "",
            password: "",
            cfmPassword: ""
        })
    }

    return (
        <div className='mt-4'>
            <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="ml-2 block text-teal bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800"
                type="button"
            >
                Add New User
            </button>

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
                                    Add New User
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
                                <form className="space-y-4" onSubmit={submitNewUserDetails}>
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-teal-900 dark:text-teal"
                                        >
                                            User Name
                                        </label>
                                        <input
                                            type="text"
                                            value={inputUserData.name}
                                            onChange={(e) => handleInputUserData(e.target.name, e.target.value)}
                                            name="name"
                                            id="name"
                                            className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                            placeholder="Dharaksha Team Member"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-teal-900 dark:text-teal"
                                        >
                                            User Email
                                        </label>
                                        <input
                                            type="email"
                                            value={inputUserData.email}
                                            onChange={(e) => handleInputUserData(e.target.name, e.target.value)}
                                            name="email"
                                            id="email"
                                            className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                            placeholder="team@dharaksha.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="block text-sm font-medium text-teal-900 dark:text-teal"
                                        >
                                            User Role
                                        </label>
                                        <select
                                            value={inputUserData.role}
                                            onChange={(e) => handleInputUserData(e.target.name, e.target.value)}
                                            name="role"
                                            id="role"
                                            className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                            required
                                        >
                                            <option value="">...Select Role...</option>
                                            <option value="Admin">Admin</option>
                                            <option value="QR Code Generator">QR Code Generator</option>
                                            <option value="Supervisor (LC Preparation)">Supervisor (LC Preparation)</option>
                                            <option value="Supervisor (LC Rejection)">Supervisor (LC Rejection)</option>
                                            <option value="Supervisor (Bag Inoculation)">Supervisor (Bag Inoculation)</option>
                                            <option value="Supervisor (Bag Incubation)">Supervisor (Bag Incubation)</option>
                                            <option value="Supervisor (Mould Filling)">Supervisor (Mould Filling)</option>
                                            <option value="Supervisor (Mould Rejection)">Supervisor (Mould Rejection)</option>
                                            <option value="Supervisor (De-Moulding)">Supervisor (De-Moulding)</option>
                                            <option value="Supervisor (Growth Chamber)">Supervisor (Growth Chamber)</option>
                                            <option value="Supervisor (Oven In)">Supervisor (Oven In)</option>
                                            <option value="Supervisor (Oven Out)">Supervisor (Oven Out)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-teal-900 dark:text-teal"
                                        >
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={inputUserData.password}
                                            onChange={(e) => handleInputUserData(e.target.name, e.target.value)}
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="cfmPassword"
                                            className="block text-sm font-medium text-teal-900 dark:text-teal"
                                        >
                                            Confirm Password
                                        </label>
                                        <input
                                            type="String"
                                            value={inputUserData.cfmPassword}
                                            onChange={(e) => handleInputUserData(e.target.name, e.target.value)}
                                            name="cfmPassword"
                                            id="cfmPassword"
                                            placeholder="••••••••"
                                            className="border border-teal-300 rounded-md px-4 py-2 w-full"
                                            required
                                        />
                                    </div>
                                    <div className="flex mt-8">
                                        <button type="submit" disabled={createButtonDisable}
                                            className={`
                                            ${createButtonDisable ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:bg-green-800 dark:hover:text-white'}
                                            text-green-700 border border-green-700 focus:ring-4 focus:outline-none focus:ring-green-300
                                            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500
                                            dark:text-green-500 ${!createButtonDisable ? 'dark:hover:bg-green-600 dark:focus:ring-green-800' : ''}`}
                                        >
                                            Add User
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

export default AddNewUser;
