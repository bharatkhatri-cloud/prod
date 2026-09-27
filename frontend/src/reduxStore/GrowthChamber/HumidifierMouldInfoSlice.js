import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const fetchMouldInfo = createAsyncThunk(
    'growthChamber/fetchMouldInfo',
    async (queryParams = {}) => {
        try {
            const SPRING_HOST = process.env.REACT_APP_SPRING_BACKEND;
            const params = new URLSearchParams();

            const fields = [
                'startDate', 'endDate',
                'minGrowthType', 'maxGrowthType',
                'typeOfMould',
                'removedStartDate', 'removedEndDate',
                'page', 'resultPerPage',
            ];

            fields.forEach(key => {
                const val = queryParams[key];
                if (val !== undefined && val !== null && val !== '') {
                    params.append(key, val);
                }
            });

            const url = `${SPRING_HOST}api/v2s/humidifier/mould-info?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const err = await response.json();
                toast.error(err.message || 'Failed to fetch mould info');
                return err;
            }

            return await response.json();
        } catch (error) {
            console.error('Unable to fetch mould info', error);
            throw error;
        }
    }
);

const humidifierMouldInfoSlice = createSlice({
    name: 'humidifierMouldInfo',
    initialState: { data: null, isLoading: false, isError: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMouldInfo.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMouldInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchMouldInfo.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default humidifierMouldInfoSlice.reducer;
