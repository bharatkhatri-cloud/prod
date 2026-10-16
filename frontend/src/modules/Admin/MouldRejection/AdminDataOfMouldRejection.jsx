import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../assets/Loader';
import FormatTime from '../../../assets/FormatTime';
import UpdateData from '../../../assets/UpdateData';
import { fetchToGetRejectedMouldData, fetchToDeleteRejectedMould } from '../../../reduxStore/MouldRejection/MouldRejectionSlice';
import { toast } from 'react-toastify';

const AdminDataOfMouldRejection = ({ queryParams }) => {
    const state = useSelector((state) => state.mouldRejectionReducer);
    const dispatch = useDispatch();
    const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);

    // Quarantine by Mix modal state
    const [isMixModalOpen, setIsMixModalOpen] = useState(false);
    const [mixIdInput, setMixIdInput] = useState('');
    const [mixReason, setMixReason] = useState('Green Mold');
    const [mixNotes, setMixNotes] = useState('');
    const [isSubmittingMix, setIsSubmittingMix] = useState(false);

    useEffect(() => {
        dispatch(fetchToGetRejectedMouldData());
    }, [dispatch]);

    useEffect(() => {
        if (state && state.data && state.data.mouldRejectedData) {
            setGetAllDataFromCollection(state.data.mouldRejectedData);
        }
    }, [state]);

    const deleteData = async (id) => {
        if (window.confirm("Do you really want to delete?")) {
            dispatch(fetchToDeleteRejectedMould(id)).then(() => {
                dispatch(fetchToGetRejectedMouldData(queryParams));
            });
        }
    };

    // Update data modal state
    const [url, setUrl] = useState();
    const [moduleData] = useState({
        "mouldId": "Mould ID",
        "mouldRejectionReason": "Reason Of Rejection",
    });
    const [inputModuleData, setInputModuleData] = useState({
        mouldId: "",
        mouldRejectionReason: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateData = (id, currData) => {
        setIsModalOpen(true);
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/";
        const updateUrl = `${BACK_HOST}api/v1/admin/updateRjectedMould/${id}`;
        setUrl(updateUrl);

        setInputModuleData({
            mouldId: currData.mouldId,
            mouldRejectionReason: currData.mouldRejectionReason,
        });
    };

    const handleQuarantineMix = async (e) => {
        e.preventDefault();
        const cleanMixId = mixIdInput.trim();
        if (!cleanMixId) {
            toast.error("Please enter a valid Mix ID.");
            return;
        }

        try {
            setIsSubmittingMix(true);
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/";
            const response = await fetch(`${BACK_HOST}api/v1/admin/rejectMouldsByMix/${encodeURIComponent(cleanMixId)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    reasonOfRejection: mixReason,
                    notes: mixNotes
                })
            });

            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message || "Failed to quarantine mix batch.");
                return;
            }

            toast.success(data.message);
            setIsMixModalOpen(false);
            setMixIdInput('');
            setMixNotes('');
            dispatch(fetchToGetRejectedMouldData(queryParams));
        } catch (err) {
            toast.error(err.message || "Network error while quarantining mix.");
        } finally {
            setIsSubmittingMix(false);
        }
    };

    return (
        <>
            <UpdateData
                moduleData={moduleData}
                url={url}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                inputModuleData={inputModuleData}
                setInputModuleData={setInputModuleData}
                getDataAfterUpdate={fetchToGetRejectedMouldData}
                queryParams={queryParams}
            />

            {/* Quick Quarantine Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-4 bg-rose-50 border border-rose-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-rose-900">Batch Contamination Recall</h4>
                        <p className="text-xs text-rose-700">Quarantine and reject all moulds belonging to an entire Mix in 1 click.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsMixModalOpen(true)}
                    type="button"
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Quarantine by Mix ID
                </button>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block">
                        <div className="border rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Mould ID</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Mix ID</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Reason Of Rejection</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Type Of Mould</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Rejection Time</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Mould Filling Time</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border">Rejected By</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border text-center">Remove</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase border text-center">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {state.isLoading && (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-6 whitespace-nowrap text-sm text-gray-800 text-center">
                                                <Loader />
                                            </td>
                                        </tr>
                                    )}

                                    {(Array.isArray(getAllDataFromCollection) ? getAllDataFromCollection : []).map((currData, index) => (
                                        <tr className="hover:bg-teal-50 transition-colors" key={currData._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900 border">{currData?.mouldId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm border">
                                                {currData?.mixId ? (
                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-800 font-mono">
                                                        {currData.mixId}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 font-mono text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600 border">{currData?.mouldRejectionReason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData?.typeOfMould}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">
                                                <div>{FormatTime(currData.mouldRejectionDate)}</div>
                                                {currData?.updatedAt && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                        edited ({FormatTime(currData?.updatedAt)})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{FormatTime(currData?.fillingDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currData.mouldRejectedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteData(currData._id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                                                <button
                                                    type="button"
                                                    onClick={() => updateData(currData._id, currData)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quarantine by Mix ID Modal */}
            {isMixModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setIsMixModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="font-bold text-lg">Quarantine Entire Mix Batch</h3>
                            </div>
                            <button
                                onClick={() => setIsMixModalOpen(false)}
                                className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleQuarantineMix} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                    Target Mix ID (e.g. MX-20261016-1234)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Paste or enter Mix ID..."
                                    value={mixIdInput}
                                    onChange={(e) => setMixIdInput(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm font-mono rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                    Reason of Rejection
                                </label>
                                <select
                                    value={mixReason}
                                    onChange={(e) => setMixReason(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                >
                                    <option value="Green Mold">Green Mold</option>
                                    <option value="Red Mold">Red Mold</option>
                                    <option value="Black Mold">Black Mold</option>
                                    <option value="Substrate Contamination">Substrate Contamination</option>
                                    <option value="No growth">No growth</option>
                                    <option value="Patchy Growth">Patchy Growth</option>
                                    <option value="Bacterial Wet Spot">Bacterial Wet Spot</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                    Notes / Observations (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Enter batch recall notes..."
                                    value={mixNotes}
                                    onChange={(e) => setMixNotes(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                                <strong>Warning:</strong> This will reject all active mould trays filled from this mix and update the mix status to <code>QUARANTINED</code>.
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsMixModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingMix}
                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
                                >
                                    {isSubmittingMix ? "Quarantining..." : "Quarantine Entire Batch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDataOfMouldRejection;
