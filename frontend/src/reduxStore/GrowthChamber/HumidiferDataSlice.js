import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const fetchAddedMouldsData = createAsyncThunk(
    'growthChamber/getAddedMouldsData',
    async (queryParams = {}) => {
        try {
            const SPRING_HOST = process.env.REACT_APP_SPRING_BACKEND;
            const params = new URLSearchParams();

            const fields = [
                'startDate', 'endDate',
                'humidifierNo', 'batchId', 'placedBy', 'openedBy',
                'minGrowthType', 'maxGrowthType',
                'removedStartDate', 'removedEndDate',
                'markAsFilledStartDate', 'markAsFilledEndDate',
                'readingsFinishedStartDate', 'readingsFinishedEndDate',
                'page', 'resultPerPage',
            ];

            fields.forEach(key => {
                const val = queryParams[key];
                if (val !== undefined && val !== null && val !== '') {
                    params.append(key, val);
                }
            });

            const url = `${SPRING_HOST}api/v2s/humidifier/batch/get-data?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to fetch humidifier data');
                return errorData;
            }

            return await response.json();
        } catch (error) {
            console.error('Unable to fetch humidifier data', error);
            throw error;
        }
    }
);

export const fetchToPlaceNewMouldInHumidifier = createAsyncThunk(
    'growthChamber/fetchToPlaceNewMouldInHumidifier',
    async (dataOfNewBag) => {
        try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/humidifier/addmoulds`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataOfNewBag),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return errorData;
            }
            const data = await response.json();
            toast.success(data.message);
            return data;
        } catch (error) {
            console.error('The new bag is not prepared; something went wrong:', error);
            throw error;
        }
    }
);

const humidifierDataSlice = createSlice({
    name: 'humidifierData',
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddedMouldsData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAddedMouldsData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchAddedMouldsData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default humidifierDataSlice.reducer;
