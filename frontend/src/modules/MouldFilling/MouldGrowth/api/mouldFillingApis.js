const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;

export const fetchChamberData = (serialNo) =>
    fetch(`${BACK_HOST}api/v2s/chamber/get-data?serialNo=${serialNo}`, {
        credentials: 'include'
    });

export const submitPiecesToBatch = (payload) =>
    fetch(`${BACK_HOST}api/v2s/mould-filling/filled-Mould-and-placed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
    });

export const markBatchFilled = (batchId, cycleTime) =>
    fetch(`${BACK_HOST}api/v2s/mould-filling/mark-filled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, cycleTime }),
        credentials: 'include'
    });

export const fetchBatchDetails = (batchId) =>
    fetch(`${BACK_HOST}api/v2s/mould-filling/batch-details?batchId=${batchId}`);

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
    fetch(`${BACK_HOST}api/v2s/mould-filling/finish-batch`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

export const submitBatchReading = (batchId, temperature, humidity) =>
    fetch(`${BACK_HOST}api/v2s/batch/add-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, temperature, humidity }),
        credentials: 'include'
    });

export const restartCycle = (batchId, manualCycleTime) => {
    let url = `${BACK_HOST}api/v2s/batch/restart-cycle?batchId=${batchId}`;
    if (manualCycleTime && String(manualCycleTime).trim() !== '') {
        url += `&cycleTime=${manualCycleTime}`;
    }
    return fetch(url, {
        method: 'POST',
        credentials: 'include'
    });
};

export const completeCycle = (batchId) =>
    fetch(`${BACK_HOST}api/v2s/batch/complete-cycle?batchId=${batchId}`, {
        method: 'POST',
        credentials: 'include'
    });
