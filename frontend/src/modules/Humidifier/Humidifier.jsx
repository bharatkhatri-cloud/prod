import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHumidifiers } from '../../reduxStore/GrowthChamber/HumidifierSlice';
import { useNavigate } from 'react-router-dom';

const Humidifier = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const humidifiers = useSelector((state) => state.humidifierReducer);
    const [allDataFromCollection, getAllDataFromCollection] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchHumidifiers())
    }, [dispatch]);

    useEffect(() => {
        if (humidifiers.data && humidifiers.data.humidifiers) {
            getAllDataFromCollection(humidifiers.data.humidifiers)
        }
    }, [humidifiers]);

    const searchHumidifier = allDataFromCollection?.filter((currHum) => 
        currHum.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (h) => {
        const styles = "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm";
        if (h.status === 'empty' && h.dataId) {
            return <span className={`${styles} bg-amber-100 text-amber-700`}>Partial</span>;
        }
        switch (h.status) {
            case 'empty': return <span className={`${styles} bg-emerald-100 text-emerald-700`}>Empty</span>;
            case 'filledCompletely': return <span className={`${styles} bg-blue-100 text-blue-700`}>Filled</span>;
            case 'readingCollected': return <span className={`${styles} bg-purple-100 text-purple-700`}>Done</span>;
            case 'clean': return <span className={`${styles} bg-red-100 text-red-700`}>Clean</span>;
            case 'maintenance': return <span className={`${styles} bg-red-100 text-red-700`}>Maintenance</span>;
            default: return <span className={`${styles} bg-gray-100 text-gray-700`}>{h.status}</span>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 sm:p-8">
            {/* Header / Search Section */}
            <div className="sticky top-16 z-30 bg-gray-50 max-w-7xl mx-auto py-4 mb-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="Search by Serial No..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchHumidifier?.map((h) => (
                    <div 
                        key={h.serialNo} 
                        className="relative rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col gap-4 bg-white"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Serial No</span>
                                <span className="text-2xl font-bold text-gray-800 tracking-tight">{h.serialNo}</span>
                            </div>
                            {getStatusBadge(h)}
                        </div>
                        
                        <div className="mt-2">
                            {/* Actions */}
                            {h.status === 'empty' && !h.dataId && (
                                <button 
                                    onClick={() => navigate('/placeNewPieces', { state: { humidifier: h, humidifierNo: h.serialNo, dataId: h.dataId } })}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
                                >
                                    Place Mould
                                </button>
                            )}

                            {h.status === 'empty' && h.dataId && (
                                <button 
                                    onClick={() => navigate('/placeNewPieces', { state: { humidifier: h, humidifierNo: h.serialNo, dataId: h.dataId } })}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500"
                                >
                                    Placed more Mould
                                </button>
                            )}

                            {h.status === 'filledCompletely' && (
                                <button 
                                    onClick={() => navigate('/reading', { state: { humidifier: h } })}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                                >
                                    Take Reading
                                </button>
                            )}

                             {h.status === 'readingCollected' && (
                                <button 
                                    onClick={() => navigate('/remove', { state: { humidifier: h } })}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500"
                                >
                                    Remove Mould
                                </button>
                            )}
                            
                            {(h.status === 'clean' || h.status === 'maintenance') && (
                                <div className="w-full py-2 px-4 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg text-center border border-gray-100 cursor-not-allowed select-none">
                                    Maintenance
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Empty State */}
            {!searchHumidifier?.length && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">No humidifiers found</p>
                    <p className="text-sm">Try adjusting your search query</p>
                </div>
            )}
        </div>
    );
};

export default Humidifier;
