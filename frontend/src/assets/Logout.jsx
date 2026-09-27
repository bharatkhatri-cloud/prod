// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchToLogout } from '../reduxStore/authentication/userAuthSlice';
// import { Navigate } from "react-router-dom";

// const Logout = () => {
//     const dispatch = useDispatch();
//     useEffect(() => {
//         if (window.confirm("Do you really want to log out?")) {           
//             dispatch(fetchToLogout());
//         }
        
//     }, [dispatch]);
//   return (
//     <>
//       <Navigate to="/" />
//     </>
//   )
// }

// export default Logout


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToLogout } from '../reduxStore/authentication/userAuthSlice';
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated  = useSelector(state => state.userAuth); // Check authentication state
    const [logoutConfirmed, setLogoutConfirmed] = useState(false);

    useEffect(() => {
        const confirmLogout = window.confirm("Do you really want to log out?");
        if (confirmLogout) {
            setLogoutConfirmed(true);
            dispatch(fetchToLogout());
        } else {
            navigate(-1); // Go back if user cancels logout
        }
    }, [dispatch, navigate]);

    // Redirect to login page when user is logged out
    useEffect(() => {
        if (!isAuthenticated && logoutConfirmed) {
            // navigate("/admin/login");
            navigate("/");
        }
    }, [isAuthenticated, logoutConfirmed, navigate]);

    return null; // No UI needed, just handling logout
};

export default Logout;
