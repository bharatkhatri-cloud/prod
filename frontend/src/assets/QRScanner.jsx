import { Html5QrcodeScanner } from 'html5-qrcode';
import React, { useEffect, useState, useCallback } from 'react';
import './Scanner.css'

const QRScanner = ({ idName, hidden, buttonName, resultOnScanSuccess, keepScanning = false }) => {


    const [openScanner, setOpenScanner] = useState(keepScanning);

    // Memoize resultOnScanSuccess if it's changing too often
    const memoizedResultOnScanSuccess = useCallback(resultOnScanSuccess, [resultOnScanSuccess]);
    //! we have use useCallback but still this component re-rendering because of  (handleScanner) function.

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(idName, {
            qrbox: {
                width: 300,
                height: 300,
            },
            fps: 5,
        });

        const success = (result) => {
            memoizedResultOnScanSuccess(result);
            // resultOnScanSuccess(result);
            setOpenScanner(keepScanning);
            scanner.clear();
            if (!keepScanning) {
            }
        };

        if (openScanner) {
            scanner.render(success);
        }

        

        return () => {
            scanner.clear();
        };
    }, [openScanner, idName, memoizedResultOnScanSuccess]);


        const handleScanner = () => {
            setOpenScanner(!openScanner);
        };


    return (
        <>
            {!openScanner && (
                <button
                    className={`w-full text-center bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 border-4 text-white text-base	font-semibold	 py-3 px-2 rounded ${hidden ? "":"hidden"} `}
                    onClick={handleScanner}
                >
                    {buttonName || 'Scan'}
                </button>
            )}
            <div id={idName} className={`scanner col-span-2 m-2 ${hidden ? "":"hidden"} `}></div>
        </>
    );
};

export default QRScanner;



