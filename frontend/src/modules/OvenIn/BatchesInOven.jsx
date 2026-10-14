import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchOvenBatches, clearOvenBatches } from '../../reduxStore/OvenIn/OvenSlice';


const BatchesInOven = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serialNo } = useParams();

  const [ovenDetails] = useState(location.state?.oven || { serialNo });
  const { batches, isBatchesLoading: isLoading } = useSelector((state) => state.ovenReducer);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, serialNo: null, batchId: null });

  useEffect(() => {
    if (ovenDetails?.serialNo) {
      dispatch(fetchOvenBatches(ovenDetails.serialNo));
    }
    return () => {
      dispatch(clearOvenBatches());
    };
  }, [ovenDetails?.serialNo, dispatch]);

  const generateNewBatchID = () => {
    const now = new Date();
    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    month = month < 10 ? `0${month}` : month;
    date = date < 10 ? `0${date}` : date;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const batchId = `${ovenDetails.serialNo}D${date}${month}${year}T${hours}${minutes}`;
    navigate('/place-mould/create', {
      state: { oven: ovenDetails, ovenSerialNo: ovenDetails.serialNo, batchId, tempRequired: true },
    });
  };

  // Opens the confirmation modal instead of deleting immediately
  const handleRemoveClick = (serialNo, batchId) => {
    setConfirmModal({ open: true, serialNo, batchId });
  };

  const batchRemoveFromOven = async (serialNo, batchId) => {
    setConfirmModal({ open: false, serialNo: null, batchId: null });
    try {
      const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
      const url = `${BACK_HOST}api/v2s/oven-in/batch-remove?batchId=${batchId}&serialNo=${serialNo}`;
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message}`);
        return errorData;
      }
      const data = await res.json();
      toast.success(data.message);
      // ✅ Reload batches from the server via Redux
      dispatch(fetchOvenBatches(ovenDetails.serialNo));
      return data;
    } catch (error) {
      console.error('Error removing batch from oven:', error);
    }
  };

  const batchesList = Array.isArray(batches) ? batches : [];
  const filteredBatches = batchesList.filter((b) =>
    (b?.batchId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Oven</p>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{ovenDetails.serialNo}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredBatches.length} active batch{filteredBatches.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search batch ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {/* Existing batch cards */}
        {filteredBatches.map((currItem, currInd) => (
          <div
            key={currItem.batchId}
            className="relative bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col gap-4"
          >
            {/* Index badge */}
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
              <span className="text-xs font-bold text-orange-500">{batchesList.length - currInd}</span>
            </div>

            {/* Icon + label */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Batch ID</p>
                <p
                  className="text-base font-bold text-gray-800 hover:text-orange-600 cursor-pointer transition-colors truncate max-w-[10rem]"
                  title={currItem.batchId}
                  onClick={() =>
                    navigate(`/place-mould/batch/${currItem.batchId}`, {
                      state: {
                        oven: ovenDetails,
                        ovenSerialNo: ovenDetails.serialNo,
                        batchId: currItem.batchId,
                      },
                    })
                  }
                >
                  {currItem.batchId}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleRemoveClick(ovenDetails.serialNo, currItem.batchId)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* ── "Place in New Batch" — dashed + card ── */}
        <div
          onClick={generateNewBatchID}
          className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 bg-white hover:bg-orange-50/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-8 min-h-[176px]"
        >
          {/* Plus circle */}
          <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors duration-300">
            <svg
              className="w-7 h-7 text-gray-400 group-hover:text-orange-500 transition-colors duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 group-hover:text-orange-600 transition-colors">
              Place in New Batch
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Start a fresh batch</p>
          </div>
        </div>

      </div>

      {/* Empty state (only when search returns nothing AND there are actually batches) */}
      {filteredBatches.length === 0 && searchQuery && (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="w-14 h-14 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-semibold">No batches match "{searchQuery}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5 animate-[fadeIn_0.15s_ease]">
            {/* Warning icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">Remove Batch?</h3>
              <p className="text-sm text-gray-500 mt-1">Do you really want to remove batch</p>
              <p className="text-sm font-semibold text-orange-600 mt-0.5 break-all">{confirmModal.batchId}</p>
              <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, serialNo: null, batchId: null })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => batchRemoveFromOven(confirmModal.serialNo, confirmModal.batchId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesInOven;
