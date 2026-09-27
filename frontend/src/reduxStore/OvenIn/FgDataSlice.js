import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchFgData = createAsyncThunk('fgData/fetchFgData', async (queryParams) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;

        const params = { ...queryParams };

        // FilterData sends onDate for single-day filter — map it to startDate+endDate
        if (params.onDate && !params.startDate && !params.endDate) {
            params.startDate = params.onDate;
            params.endDate = params.onDate;
        }
        delete params.onDate;

        // Strip empty values
        Object.keys(params).forEach((key) => {
            if (params[key] === '' || params[key] === undefined || params[key] === null) {
                delete params[key];
            }
        });

        const url = `${BACK_HOST}api/v2s/oven-in/fg-data?${new URLSearchParams(params)}`;
        const response = await fetch(url, { method: 'GET', credentials: 'include' });

        if (!response.ok) throw new Error("Failed to fetch FG data.");
        return await response.json();
    } catch (error) {
        console.error("Error fetching FG data:", error);
        throw error;
    }
});

const fgDataSlice = createSlice({
    name: "fgData",
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFgData.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchFgData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchFgData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default fgDataSlice.reducer;
