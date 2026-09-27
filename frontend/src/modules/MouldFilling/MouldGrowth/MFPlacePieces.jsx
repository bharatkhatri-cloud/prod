import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addMouldsToBatch, fetchBatchInfo, clearBatchData } from '../../../reduxStore/MouldFilling/MouldFillingSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MFDataInBatch from './components/MFMouldInBatch';
import MFMarkFilledModal from './components/MFMarkFilledModal';
import { fetchChamberData, submitPiecesToBatch, markBatchFilled } from './api/mouldFillingApis';

//! Mould Id Condition
const MOULD_ID_PREFIX = 'M'; // Adjust as per your logic
const MOULD_ID_LENGTH = 7;

const MFPlacePieces = () => {
    const { serialNo: chamberNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [pieces, setPieces] = useState([]);
    const [currentPiece, setCurrentPiece] = useState('');
    const [bagId, setBagId] = useState('');
    const [filledBy, setFilledBy] = useState('');
    const [typeOfMould, setTypeOfMould] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey] = useState(0);

    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [cycleHours, setCycleHours] = useState('');

    const inputRef = useRef(null);

    const [activeBatchId, setActiveBatchId] = useState('');
    const [totalMoulds, setTotalMoulds] = useState(0);

    const batchInfo = useSelector((state) => state.mouldFillingReducer.batchInfo);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        if (activeBatchId) {
            dispatch(fetchBatchInfo(activeBatchId));
        } else {
            dispatch(clearBatchData());
        }
    }, [activeBatchId, dispatch]);

    useEffect(() => {
        if (!chamberNo) {
            navigate('/mould-filling');
            return;
        }
        inputRef.current?.focus();

        const loadChamberData = async () => {
            try {
                const response = await fetchChamberData(chamberNo);
                if (response.ok) {
                    const data = await response.json();
                    if (data.activeBatches && data.activeBatches.length > 0) {
                        setActiveBatchId(data.activeBatches[0].batchId);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch chamber data", err);
            }
        };
        loadChamberData();
    }, [chamberNo, navigate]);

    const handleAddPiece = (e) => {
        e.preventDefault();
        const trimmed = currentPiece.trim();

        if (trimmed.length !== MOULD_ID_LENGTH) {
            toast.error(`Mould ID should be ${MOULD_ID_LENGTH} digits`);
            return;
        }

        if (!trimmed.startsWith(MOULD_ID_PREFIX)) {
            toast.error(`Mould ID must start with ${MOULD_ID_PREFIX}`);
            return;
        }

        if (pieces.includes(trimmed)) {
            toast.warning('Piece already scanned in this session');
            setCurrentPiece('');
            return;
        }

        setPieces([...pieces, trimmed]);
        setCurrentPiece('');
        inputRef.current?.focus();
    };

    const removePiece = (indexToRemove) => {
        setPieces(pieces.filter((_, idx) => idx !== indexToRemove));
    };

    const handleMouldInputChange = (e) => {
        const val = e.target.value.toUpperCase();
        setCurrentPiece(val);
        
        const trimmed = val.trim();
        if (trimmed.length === MOULD_ID_LENGTH && trimmed.startsWith(MOULD_ID_PREFIX)) {
            if (!pieces.includes(trimmed)) {
                setPieces(prev => [...prev, trimmed]);
                setCurrentPiece('');
                toast.success('Mould Scanned');
            } else {
                toast.warning('Piece already scanned');
                setCurrentPiece('');
            }
        }
    };

    const handleSubmitPieces = async () => {
        if (pieces.length === 0) return;
        setSubmitting(true);
        try {
            let batchIdToUse = activeBatchId;
            let newlyGenerated = false;
            if (!batchIdToUse) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY
                const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, ''); // HHMM
                batchIdToUse = `${chamberNo}D${dateStr}T${timeStr}`;
                newlyGenerated = true;
            }

            const payload = {
                bagId,
                filledBy,
                typeOfMould,
                growthChamberNo: chamberNo,
                batchId: batchIdToUse,
                mould: pieces.map(id => ({ mouldId: id }))
            };

            const response = await submitPiecesToBatch(payload);

            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || 'Failed to place pieces');
            } else {
                toast.success('Pieces successfully placed');
                
                // Add to Redux state to avoid refetching
                const newMouldsForState = pieces.map(id => ({
                    mouldId: id,
                    typeOfMould: typeOfMould,
                    mouldTransferHistory: [{
                        batchId: batchIdToUse,
                        scanInTime: new Date().toISOString()
                    }]
                }));
                dispatch(addMouldsToBatch(newMouldsForState));

                if (newlyGenerated) {
                    setActiveBatchId(batchIdToUse);
                    toast.info(`Generated Batch ID: ${batchIdToUse}`);
                }
                
                // Fetch latest batch info so placing time is updated
                dispatch(fetchBatchInfo(batchIdToUse));

                setPieces([]);
                setBagId('');
                setFilledBy('');
                setTypeOfMould('');
            }
        } catch (err) {
            toast.error('Network error. Failed to place pieces.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkFilledConfirm = async () => {
        if (!activeBatchId) {
            toast.error("No active batch found to mark filled.");
            return;
        }
        try {
            const response = await markBatchFilled(activeBatchId, parseFloat(cycleHours));

            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || 'Failed to mark as filled');
            } else {
                toast.success('Chamber marked as filled successfully');
                dispatch(fetchBatchInfo(activeBatchId));
                navigate('/mould-filling');
            }
        } catch (err) {
            toast.error('Network error.');
        }
        setIsMarkModalOpen(false);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Place Moulds</h2>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <p>Chamber: <span className="font-bold text-gray-700">{chamberNo}</span></p>
                            <p>Batch: <span className="font-bold text-gray-700">{activeBatchId || 'N/A'}</span></p>
                            <p>Total Mould: <span className="font-bold text-gray-700">{totalMoulds}</span></p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <p>Batch started at: <span className="font-semibold text-gray-700">{batchInfo?.placingTime ? formatDateTime(batchInfo.placingTime) : 'Batch not started yet'}</span></p>
                            <p>Batch completely filled: <span className="font-semibold text-gray-700">{batchInfo?.markAsFilledTime ? formatDateTime(batchInfo.markAsFilledTime) : 'Mould is scanning...'}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/mould-filling')}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Back to Chamber
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scanner Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <form onSubmit={handleAddPiece} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Scan Bag ID</label>
                                <input
                                    type="text"
                                    value={bagId}
                                    onChange={(e) => setBagId(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Input Bag ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filled By</label>
                                <input
                                    type="text"
                                    value={filledBy}
                                    onChange={(e) => setFilledBy(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Input Filled By"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Mould</label>
                                <input
                                    type="text"
                                    value={typeOfMould}
                                    onChange={(e) => setTypeOfMould(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Input Type of Mould"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Scan Mould ID</label>
                                <div className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentPiece}
                                        onChange={handleMouldInputChange}
                                        className="flex-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Scan ID (e.g. M...)"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentPiece.trim()}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </form>

                        {pieces.length > 0 && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-700">Scanned Moulds ({pieces.length})</h3>
                                    <button
                                        onClick={() => setPieces([])}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Clear List
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {pieces.map((piece, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                            <span className="text-sm font-mono text-gray-700">{piece}</span>
                                            <button onClick={() => removePiece(idx)} className="text-gray-400 hover:text-red-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={handleSubmitPieces}
                                        disabled={submitting}
                                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow disabled:opacity-50 transition-colors"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setBagId('');
                                            setFilledBy('');
                                            setTypeOfMould('');
                                            setPieces([]);
                                        }}
                                        className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
               
                    {/* Actions Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Ready to Start Cycle?</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Once all moulds have been placed inside, mark the chamber as full to begin the growth cycle. No more items can be added after this point.
                            </p>
                            <button
                                onClick={() => setIsMarkModalOpen(true)}
                                disabled={!activeBatchId}
                                className="mt-4 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                            >
                                Mark Chamber Full & Start Cycle
                            </button>
                            {!activeBatchId && <p className="text-xs text-amber-600 font-medium">Add and submit pieces first.</p>}
                    </div>
                </div>

                {/* Batch Data Table */}
                <MFDataInBatch dataId={activeBatchId} refreshKey={refreshKey} onCountChange={setTotalMoulds} />
            </div>

            <MFMarkFilledModal
                isOpen={isMarkModalOpen}
                onClose={() => setIsMarkModalOpen(false)}
                onConfirm={handleMarkFilledConfirm}
                cycleHours={cycleHours}
                setCycleHours={setCycleHours}
            />
        </div>
    );
};

export default MFPlacePieces;
