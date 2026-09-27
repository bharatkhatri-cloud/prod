import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const fetchSmfgBatchData = createAsyncThunk(
    'smfg/fetchSmfgBatchData',
    async () => {
        try {
            const SPRING_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${SPRING_HOST}api/v2s/smfg/all-batches`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const err = await response.text();
                toast.error(err || 'Failed to fetch SMFG batch data');
                return Promise.reject(err);
            }

            return await response.json();
        } catch (error) {
            console.error('Unable to fetch SMFG batch data', error);
            throw error;
        }
    }
);

const smfgBatchDataSlice = createSlice({
    name: 'smfgBatchData',
    initialState: { data: [], isLoading: false, isError: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSmfgBatchData.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchSmfgBatchData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchSmfgBatchData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default smfgBatchDataSlice.reducer;
