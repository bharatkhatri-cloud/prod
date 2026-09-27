import { toast } from 'react-toastify';

const NOT_IMPLEMENTED = 'API not implemented yet';

const notImplementedResponse = () => ({
    ok: false,
    text: async () => NOT_IMPLEMENTED,
    json: async () => ({ message: NOT_IMPLEMENTED }),
});

const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;

export const fetchChamberData = (serialNo) =>
    fetch(`${BACK_HOST}api/v2s/chamber/get-data?serialNo=${serialNo}`, {
        credentials: 'include'
    }).catch(() => {
        toast.info(NOT_IMPLEMENTED);
        return notImplementedResponse();
    });

export const submitPiecesToBatch = (payload) =>
    fetch(`${BACK_HOST}api/v2s/smfg/place`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
    });

export const markBatchFilled = (batchId, cycleTime) =>
    fetch(`${BACK_HOST}api/v2s/smfg/mark-filled`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batchId, cycleTime }),
        credentials: 'include'
    });

export const fetchBatchDetails = (batchId) =>
    fetch(`${BACK_HOST}api/v2s/smfg/batch-details?batchId=${batchId}`, {
        credentials: 'include'
    }).catch(() => {
        toast.info(NOT_IMPLEMENTED);
        return notImplementedResponse();
    });

export const fetchBatchReadings = (batchId) =>
    fetch(`${BACK_HOST}api/v2s/batch/get-readings?batchId=${batchId}`, {
        credentials: 'include'
    });

export const deleteBatchReading = (batchId, timestamp) =>
    fetch(`${BACK_HOST}api/v2s/batch/remove-reading?batchId=${batchId}&timestamp=${timestamp}`, {
        method: 'DELETE',
        credentials: 'include'
    });

export const finishBatch = (formData) =>
    fetch(`${BACK_HOST}api/v2s/smfg/finish-batch`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

export const submitBatchReading = (batchId, temperature, humidity) =>
    fetch(`${BACK_HOST}api/v2s/batch/add-reading`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batchId, temperature, humidity }),
        credentials: 'include'
    });

export const restartCycle = (batchId, cycleTime) => {
    const params = new URLSearchParams({ batchId });
    if (cycleTime !== undefined && cycleTime !== null && cycleTime !== '') {
        params.append('cycleTime', cycleTime);
    }
    return fetch(`${BACK_HOST}api/v2s/batch/restart-cycle?${params.toString()}`, {
        method: 'POST',
        credentials: 'include'
    });
};

export const completeCycle = (batchId) =>
    fetch(`${BACK_HOST}api/v2s/batch/complete-cycle?batchId=${batchId}`, {
        method: 'POST',
        credentials: 'include'
    });
