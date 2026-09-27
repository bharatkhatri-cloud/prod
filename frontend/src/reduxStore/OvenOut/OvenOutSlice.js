import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export const fetchAllOvenOutData = createAsyncThunk('ovenout/fetchAllOvenOutData', async (queryParams, { rejectWithValue }) => {
    try {

        const params = new URLSearchParams(queryParams);
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
        const url = `${BACK_HOST}api/v2s/oven-out/get-data?${params}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return rejectWithValue('Failed to fetch all Ovenout data.');
        }

        const data = await response.json();
        toast.success(`${data.message}`)
        return data;

    } catch (error) {
        console.error('Error while fetching all Ovenout data: ', error);
        return rejectWithValue(error.message);
    }
});

export const fetchToDeleteOvenOutData = createAsyncThunk('ovenout/fetchToDeleteOvenOutData', async (id, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/delOvenOutFG/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to delete Ovenout data.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error('Error while deleting Ovenout data: ', error);
        return rejectWithValue(error.message);
    }
});



const ovenoutSlice = createSlice({
    name: 'ovenout',
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
          

            // For fetching all Ovenout data
            .addCase(fetchAllOvenOutData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllOvenOutData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllOvenOutData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting Ovenout data
            .addCase(fetchToDeleteOvenOutData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteOvenOutData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteOvenOutData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            
    },
});

export default ovenoutSlice.reducer;
