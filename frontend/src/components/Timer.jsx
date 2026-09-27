import React from 'react'

const Timer = () => {
    return (
        <>
            <div className="flex items-start justify-center w-full gap-1 count-down-main">
                <div className="timer">
                    <div className="bg-indigo-600 rounded-lg overflow-hidden">
                        <h3 className="countdown-element days font-Cormorant font-semibold text-md text-white text-center">
                            24
                        </h3>
                    </div>
                    <p className="text-sm font-Cormorant font-medium text-gray-900 mt-1 text-center w-full">Days</p>
                </div>
                <h3 className="font-manrope font-semibold text-md text-gray-900">:</h3>
                <div className="timer">
                    <div className="bg-indigo-600 rounded-lg overflow-hidden">
                        <h3 className="countdown-element days font-Cormorant font-semibold text-md text-white text-center">
                            24
                        </h3>
                    </div>
                    <p className="text-sm font-Cormorant font-medium text-gray-900 mt-1 text-center w-full">Hours</p>
                </div>
                <h3 className="font-manrope font-semibold text-md text-gray-900">:</h3>
                <div className="timer">
                    <div className="bg-indigo-600 rounded-lg overflow-hidden">
                        <h3 className="countdown-element days font-Cormorant font-semibold text-md text-white text-center">
                            24
                        </h3>
                    </div>
                    <p className="text-sm font-Cormorant font-medium text-gray-900 mt-1 text-center w-full">Minutes</p>
                </div>
                <h3 className="font-manrope font-semibold text-md text-gray-900">:</h3>
                <div className="timer">
                    <div className="bg-indigo-600 rounded-lg overflow-hidden">
                        <h3 className="countdown-element days font-Cormorant font-semibold text-md text-white text-center">
                            24
                        </h3>
                    </div>
                    <p className="text-sm font-Cormorant font-medium text-gray-900 mt-1 text-center w-full">Secs</p>
                </div>

         

             

                

              
            </div>

        </>
    )
}

export default Timer
