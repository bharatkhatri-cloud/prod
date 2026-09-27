import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch SMFG batch info
export const fetchSmfgBatchInfo = createAsyncThunk(
    'smFgGrowth/fetchSmfgBatchInfo',
    async (batchId, { rejectWithValue }) => {
        try {
            const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${BACK_HOST}api/v2s/smfg/batch-info?batchId=${batchId}`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const err = await response.text();
                return rejectWithValue(err || 'Failed to fetch SMFG batch info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching SMFG batch info:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Thunk to fetch moulds in an SMFG batch
export const fetchSmfgMouldsByBatch = createAsyncThunk(
    'smFgGrowth/fetchSmfgMouldsByBatch',
    async (batchId, { rejectWithValue }) => {
        try {
            const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${BACK_HOST}api/v2s/smfg/id-by-batch?batchId=${batchId}`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const err = await response.text();
                return rejectWithValue(err || 'Failed to fetch moulds by batch');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching moulds by batch:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    batchInfo: null,
    mouldsByBatch: [],
    isLoading: false,
    isError: false,
};

const smFgGrowthSlice = createSlice({
    name: 'smFgGrowth',
    initialState,
    reducers: {
        clearSmfgBatchData: (state) => {
            state.batchInfo = null;
            state.mouldsByBatch = [];
            state.isError = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchSmfgBatchInfo
            .addCase(fetchSmfgBatchInfo.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchSmfgBatchInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.batchInfo = action.payload;
            })
            .addCase(fetchSmfgBatchInfo.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            // fetchSmfgMouldsByBatch
            .addCase(fetchSmfgMouldsByBatch.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchSmfgMouldsByBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mouldsByBatch = action.payload || [];
            })
            .addCase(fetchSmfgMouldsByBatch.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    }
});

export const { clearSmfgBatchData } = smFgGrowthSlice.actions;
export default smFgGrowthSlice.reducer;
