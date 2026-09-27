import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DataInHumidifier = ({ dataId, humidifier, refreshKey, readOnly = false }) => {


  const [retrieve] = useState(false);
  const [humData, setHumData] = useState();

  useEffect(() => {
    if (!dataId) return;
    const fetchData = async () => {
      try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/humidifier/dataInHumidifier/${dataId}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: 'include'
        })
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message);
          return errorData
        }

        const data = await res.json();
        // toast.success(data.message); // Only show error toasts to avoid spam on load
        setHumData(data)
        return data

      } catch (error) {
        console.log("Error in fetching data from humidifier");
      }
    };
    fetchData();
  }, [retrieve, dataId, refreshKey]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = humData?.data.smFgData?.filter(item => 
    item.smFgId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-shrink-0">
                 <h3 className="text-lg font-bold text-gray-800">Placed Pieces</h3>
                 <p className="text-sm text-gray-500">Total items: {filteredData.length}</p>
            </div>
          
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Search IDs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                        <th scope="col" className="px-6 py-4">S.No.</th>
                        <th scope="col" className="px-6 py-4">Piece ID</th>
                        {!readOnly && <th scope="col" className="px-6 py-4 text-right">Action</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {[...filteredData].reverse().map((currItem, index) => (
                        <tr
                            key={index}
                            className="group hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                {filteredData.length - index}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                                {currItem.smFgId}
                            </td>
                           {!readOnly && (
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </td>
                           )}
                        </tr>
                    ))}
                    {!filteredData.length && (
                         <tr>
                            <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm">
                                {searchQuery ? 'No pieces match your search.' : 'No pieces placed yet. Scan items above to add them.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default DataInHumidifier;
