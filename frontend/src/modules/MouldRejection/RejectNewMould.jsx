import React, { useState } from "react";
import { toast } from "react-toastify";
import CollectionIdsInput from "../../components/CollectionIdsInput";
import useUpdateData from "../../hooks/useUpdateData";
import Loading from "../../assets/Loading";

const RejectNewMould = () => {
  const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/";
  const url = `${BACK_HOST}api/v1/rejectMould`;
  const { updateData, loading } = useUpdateData(url);

  const [mode, setMode] = useState("moulds"); // 'moulds' | 'mix'

  // Individual moulds state
  const [mouldData, setMouldData] = useState({
    mouldRejectionReason: "",
    mouldId: [],
    remarks: "",
  });
  const [listOfIds, setListOfIds] = useState([]);

  // Batch Mix state
  const [mixId, setMixId] = useState("");
  const [mixReason, setMixReason] = useState("");
  const [mixRemarks, setMixRemarks] = useState("");
  const [isSubmittingMix, setIsSubmittingMix] = useState(false);

  const handleInputData = (key, value) => {
    setMouldData({ ...mouldData, [key]: value });
  };

  const submitMouldData = async (e) => {
    e.preventDefault();

    if (!listOfIds.length) {
      toast.error("Please add at least one Mould ID.");
      return;
    }
    if (!mouldData.mouldRejectionReason) {
      toast.error("Please select a reason of rejection.");
      return;
    }

    const submissionData = {
      mouldId: [...listOfIds],
      mouldRejectionReason:
        mouldData.mouldRejectionReason === "Other"
          ? `Other: ${mouldData.remarks}`
          : mouldData.mouldRejectionReason,
    };

    const response = await updateData(submissionData);

    if (!response.success) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
    setListOfIds([]);
    setMouldData({
      mouldRejectionReason: "",
      mouldId: [],
      remarks: "",
    });
  };

  const submitMixQuarantine = async (e) => {
    e.preventDefault();
    const cleanMixId = mixId.trim();
    if (!cleanMixId) {
      toast.error("Please enter a valid Mix ID.");
      return;
    }
    if (!mixReason) {
      toast.error("Please select a reason of rejection.");
      return;
    }

    try {
      setIsSubmittingMix(true);
      const res = await fetch(`${BACK_HOST}api/v1/rejectMouldsByMix/${encodeURIComponent(cleanMixId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reasonOfRejection: mixReason === "Other" ? `Other: ${mixRemarks}` : mixReason,
          notes: mixRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to quarantine mix batch.");
        return;
      }

      toast.success(data.message);
      setMixId("");
      setMixReason("");
      setMixRemarks("");
    } catch (err) {
      toast.error(err.message || "Network error while quarantining mix.");
    } finally {
      setIsSubmittingMix(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-5 sm:mx-auto mx-4 my-6 rounded-xl shadow-lg border border-gray-100">
      {/* Mode Selector Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
        <button
          type="button"
          onClick={() => setMode("moulds")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            mode === "moulds"
              ? "bg-white text-teal-800 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Reject Individual Moulds
        </button>
        <button
          type="button"
          onClick={() => setMode("mix")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            mode === "mix"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Quarantine Whole Mix Batch
        </button>
      </div>

      {mode === "moulds" ? (
        <form onSubmit={submitMouldData}>
          <label htmlFor="mouldRejectionReason" className="block text-sm font-semibold text-gray-700">
            Reason of Rejection:
          </label>
          <select
            id="mouldRejectionReason"
            value={mouldData.mouldRejectionReason}
            name="mouldRejectionReason"
            onChange={(e) => handleInputData(e.target.name, e.target.value)}
            className="block w-full mt-1 p-2.5 text-gray-900 border border-teal-300 rounded-lg bg-gray-50 text-sm focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="">Select Reason...</option>
            <option value="Mold Break during Demolding">Mold Break during Demolding</option>
            <option value="Green Mold">Green Mold</option>
            <option value="Red Mold">Red Mold</option>
            <option value="Black Mold">Black Mold</option>
            <option value="No growth">No growth</option>
            <option value="Patchy Growth">Patchy Growth</option>
            <option value="Partial Growth">Partial Growth</option>
            <option value="Other">Other</option>
          </select>

          {mouldData.mouldRejectionReason === "Other" && (
            <div className="mt-3">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                Remarks for other:
              </label>
              <input
                type="text"
                id="remarks"
                value={mouldData.remarks}
                name="remarks"
                onChange={(e) => handleInputData("remarks", e.target.value)}
                className="block w-full mt-1 p-2 text-gray-900 border border-teal-300 rounded-lg bg-gray-50 text-sm focus:ring-teal-500"
                placeholder="Specify cause..."
                required
              />
            </div>
          )}

          <div className="mt-4">
            <CollectionIdsInput
              moduleIdName="Mould Id"
              placeHolder={"M02202"}
              idPrefix="M"
              idLength={7}
              listOfIds={listOfIds}
              setListOfIds={setListOfIds}
            />
          </div>

          <div className="pt-4 flex">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? <Loading /> : "Submit Rejections"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitMixQuarantine} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <strong>Batch Recall:</strong> Enter the Mix ID to immediately reject all active mould trays filled from this batch.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mix ID to Quarantine
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MX-20261016-1234"
              value={mixId}
              onChange={(e) => setMixId(e.target.value)}
              className="w-full p-2.5 text-sm font-mono border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Reason of Rejection
            </label>
            <select
              value={mixReason}
              onChange={(e) => setMixReason(e.target.value)}
              required
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">Select Reason...</option>
              <option value="Green Mold">Green Mold</option>
              <option value="Red Mold">Red Mold</option>
              <option value="Black Mold">Black Mold</option>
              <option value="Substrate Contamination">Substrate Contamination</option>
              <option value="Bacterial Infection">Bacterial Infection</option>
              <option value="No growth across batch">No growth across batch</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {mixReason === "Other" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Remarks for other
              </label>
              <input
                type="text"
                required
                value={mixRemarks}
                onChange={(e) => setMixRemarks(e.target.value)}
                placeholder="Specify cause..."
                className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmittingMix}
              className="w-full py-2.5 text-sm font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {isSubmittingMix ? "Quarantining Mix..." : "Quarantine All Moulds in Mix"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RejectNewMould;
