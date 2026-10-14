import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToLogout, logoutUser } from '../reduxStore/authentication/userAuthSlice';
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Immediate clean logout without blocking browser dialog
        dispatch(logoutUser());
        dispatch(fetchToLogout());

        // Clear any stored session identifiers
        try {
            document.cookie = "dhaDbTkn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.removeItem("user");
            sessionStorage.clear();
        } catch (e) {
            console.error("Storage clear error:", e);
        }

        // Redirect immediately to login screen
        navigate("/", { replace: true });
    }, [dispatch, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-gray-600">Logging out...</p>
            </div>
        </div>
    );
};

export default Logout;
