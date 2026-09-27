// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { rdxStore } from './reduxStore/rdxStore';
// import { Provider } from "react-redux"
// import { ToastContainer } from 'react-toastify';
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <Provider store={rdxStore}>

//       {/* <React.StrictMode> */}
//         <App />
//         <ToastContainer autoClose={4000} hideProgressBar={true} theme="colored"/>
//       {/* </React.StrictMode> */}
//   </Provider>
// );




import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { rdxStore } from './reduxStore/rdxStore';
import { Provider } from "react-redux";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Route, Routes } from "react-router-dom"; // ✅ Import BrowserRouter
import Login from './assets/Login';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={rdxStore}>
    <BrowserRouter> {/* ✅ Wrap App inside BrowserRouter */}
      <App />
      <ToastContainer autoClose={4000} hideProgressBar={true} theme="colored"/>
       {/* <Routes>
           <Route path="/access-user-info" element={<AccessUserInfo />} />
       </Routes> */}
    </BrowserRouter>
  </Provider>
);
