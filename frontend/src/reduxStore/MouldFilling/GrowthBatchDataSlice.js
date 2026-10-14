import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const fetchGrowthBatchData = createAsyncThunk(
    'mouldFilling/fetchGrowthBatchData',
    async (queryParams = {}) => {
        try {
            const SPRING_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
            const url = `${SPRING_HOST}api/v2s/batch/all-batches`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const err = await response.text();
                toast.error(err || 'Failed to fetch growth batch data');
                return Promise.reject(err);
            }

            return await response.json();
        } catch (error) {
            console.error('Unable to fetch growth batch data', error);
            throw error;
        }
    }
);

const growthBatchDataSlice = createSlice({
    name: 'growthBatchData',
    initialState: { data: [], isLoading: false, isError: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGrowthBatchData.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchGrowthBatchData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchGrowthBatchData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default growthBatchDataSlice.reducer;
