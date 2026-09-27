import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const fetchOvenInData = createAsyncThunk('ovenin/fetchOvenInData', async (_, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/getDataOfOvenIn`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        console.log("response", response);

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to fetch oven in data');
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error('Error while fetching oven in: ', error);
        return rejectWithValue(error.message);
    }
});




const oveninSlice = createSlice({
    name: 'ovenin',
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        
            //? For adding new batch of semi-finished goods
            .addCase(fetchOvenInData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOvenInData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchOvenInData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })


            
    },
});

export default oveninSlice.reducer;