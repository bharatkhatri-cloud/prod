import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to create a new Mould Filling
export const fetchToCreateNewMouldFilling = createAsyncThunk('mouldFilling/fetchToCreateNewMouldFilling', async (newMouldData) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/filledNewMould`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newMouldData),
            credentials:'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to create a new mould filling.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while creating new mould filling: ", error);
        throw error;
    }
});

// Thunk to fetch Mould Filling data
export const fetchToGetMouldFillingData = createAsyncThunk('mouldFilling/fetchToGetMouldFillingData', async (queryParams) => {
    try {
        const params = new URLSearchParams(queryParams);
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/getMouldData?${params}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials:'include'
        });

        if (!response.ok) {
            throw new Error("Failed to fetch mould filling data.");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error while fetching mould filling data: ", error);
        throw error;
    }
});

// Thunk to fetch Mould Filling data (new v2 API)
export const fetchToGetMouldFillingDataV2 = createAsyncThunk('mouldFilling/fetchToGetMouldFillingDataV2', async (queryParams) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;

        const params = { ...queryParams };

        // FilterData sends onDate for single-day filter — map it to startDate+endDate
        if (params.onDate && !params.startDate && !params.endDate) {
            params.startDate = params.onDate;
            params.endDate = params.onDate;
        }
        delete params.onDate;

        // Strip empty values so they don't get sent as blank query strings
        Object.keys(params).forEach((key) => {
            if (params[key] === '' || params[key] === undefined || params[key] === null) {
                delete params[key];
            }
        });

        const url = `${BACK_HOST}api/v2s/mould-filling/get-data?${new URLSearchParams(params)}`;
        const response = await fetch(url, { method: 'GET', credentials: 'include' });

        if (!response.ok) {
            throw new Error("Failed to fetch mould filling data.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error while fetching mould filling data v2: ", error);
        throw error;
    }
});

// Thunk to fetch moulds by batch
export const fetchMouldsByBatch = createAsyncThunk('mouldFilling/fetchMouldsByBatch', async (batchId) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/mould-filling/moulds-by-batch?batchId=${batchId}`;
        const response = await fetch(url, { method: 'GET', credentials: 'include' });

        if (!response.ok) {
            throw new Error("Failed to fetch moulds by batch.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error while fetching moulds by batch: ", error);
        throw error;
    }
});

// Thunk to fetch batch info
export const fetchBatchInfo = createAsyncThunk('mouldFilling/fetchBatchInfo', async (batchId) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/mould-filling/batch-info?batchId=${batchId}`;
        const response = await fetch(url, { method: 'GET', credentials: 'include' });

        if (!response.ok) {
            throw new Error("Failed to fetch batch info.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error while fetching batch info: ", error);
        throw error;
    }
});

// Thunk to delete Mould Filling data
export const fetchToDeleteMouldFillingData = createAsyncThunk('mouldFilling/fetchToDeleteMouldFillingData', async (id) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteMouldData/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials:'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete mould filling data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting mould filling data: ", error);
        throw error;
    }
});

// Thunk to update Mould Filling data
export const fetchToUpdateMouldFillingData = createAsyncThunk('mouldFilling/fetchToUpdateMouldFillingData', async ({ id, updatedData }) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateMouldFillingData/${id}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
            credentials:'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to update mould filling data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while updating mould filling data: ", error);
        throw error;
    }
});

const mouldFillingSlice = createSlice({
    name: "mouldFilling",
    initialState: {
        data: null,
        mouldsByBatch: [],
        batchInfo: null,
        isLoading: false,
        isError: false,
    },
    reducers: {
        addMouldsToBatch: (state, action) => {
            state.mouldsByBatch = [...state.mouldsByBatch, ...action.payload];
        },
        clearBatchData: (state) => {
            state.mouldsByBatch = [];
            state.batchInfo = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // For new Mould Filling
            .addCase(fetchToCreateNewMouldFilling.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToCreateNewMouldFilling.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToCreateNewMouldFilling.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching Mould Filling data
            .addCase(fetchToGetMouldFillingData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToGetMouldFillingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToGetMouldFillingData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching Mould Filling data (v2)
            .addCase(fetchToGetMouldFillingDataV2.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToGetMouldFillingDataV2.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToGetMouldFillingDataV2.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting Mould Filling data
            .addCase(fetchToDeleteMouldFillingData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteMouldFillingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteMouldFillingData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For updating Mould Filling data
            .addCase(fetchToUpdateMouldFillingData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToUpdateMouldFillingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToUpdateMouldFillingData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // For fetching moulds by batch
            .addCase(fetchMouldsByBatch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMouldsByBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mouldsByBatch = action.payload;
            })
            .addCase(fetchMouldsByBatch.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // For fetching batch info
            .addCase(fetchBatchInfo.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBatchInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batchInfo = action.payload;
            })
            .addCase(fetchBatchInfo.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export const { addMouldsToBatch, clearBatchData } = mouldFillingSlice.actions;
export default mouldFillingSlice.reducer;



