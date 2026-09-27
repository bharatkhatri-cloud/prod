import React, { useEffect, useState } from 'react';
import FormatTime from '../../assets/FormatTime';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DataOfOvenBatchWise = ({ batchID, serialNo, setTemp, retrieve }) => {
  const [ovenBatchData, setOvenBatchData] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
        const url = `${BACK_HOST}api/v2s/oven-in/batch-wise-data?batchIdOfOvenIn=${batchID}&serialNo=${serialNo}`;
        
        // Add a 600ms artificial delay so the smooth loading bar is visible on fast local networks
        await new Promise((resolve) => setTimeout(resolve, 600));

        const res = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message);
          return errorData;
        }
        const data = await res.json();
        setOvenBatchData(data);
        return data;
      } catch (error) {
        console.log('Error in fetching data from oven and batch');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [retrieve, batchID, serialNo]);

  useEffect(() => {
    if (ovenBatchData?.piecesData?.[0]?.temp !== undefined) {
      setTemp(ovenBatchData.piecesData[0].temp);
    }
  }, [ovenBatchData, setTemp]);

  const pieces = ovenBatchData?.piecesData?.[0];



  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar {
          animation: loadingBar 1.2s infinite linear;
        }
      `}</style>

      {/* Card header */}
      {pieces && (
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-0.5">
              Batch Summary
            </p>
            <h2 className="text-base font-bold text-gray-800">
              {pieces.ovenSerialNo} &mdash; {pieces.batchIdOfOvenIn}
            </h2>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              🌡️ <span className="font-semibold text-gray-700">{pieces.temp ?? '—'}°C</span>
            </span>
            <span>
              ⏱ <span className="font-semibold text-gray-700">{FormatTime(pieces.batchInTime)}</span>
            </span>
          </div>
        </div>
      )}



      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">S.No</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Piece ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Type</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">In Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {/* Thin loading bar directly under the table header */}
            <tr>
              <td colSpan={4} className="p-0 border-0 h-0.5 relative overflow-hidden bg-transparent">
                {isLoading && (
                  <div className="absolute inset-0 bg-orange-50">
                    <div className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-loading-bar"></div>
                  </div>
                )}
              </td>
            </tr>
            {pieces?.ovenInSemiFGIds?.slice().reverse().map((currItem, index) => (
              <tr key={index} className="hover:bg-orange-50 transition-colors">
                <td className="px-6 py-3 text-sm text-gray-400 font-medium">
                  {pieces.ovenInSemiFGIds.length - index}
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                  {currItem.smFgId}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 font-semibold">
                  {currItem.type || 'N/D'}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {FormatTime(currItem.inTime)}
                </td>
              </tr>
            ))}
            {!pieces && !isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  No data yet — scan a piece ID above to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Piece count footer */}
      {pieces && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
          <span>Total pieces in this batch</span>
          <span className="font-bold text-orange-600">{pieces.ovenInSemiFGIds?.length ?? 0}</span>
        </div>
      )}
    </div>
  );
};

export default DataOfOvenBatchWise;
