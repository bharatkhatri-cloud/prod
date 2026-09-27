import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Thunk to fetch rejected mold data
export const fetchToGetRejectedMouldData = createAsyncThunk('mouldRejection/fetchToGetRejectedMouldData', async (queryParams) => {
    try {
        const params = new URLSearchParams(queryParams);
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/getRejectedMouldData?${params}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials:"include"
        });

        if (!response.ok) {
            throw new Error("Failed to fetch rejected mold data.");
        }

        const data = await response.json();
        console.log("dat data",data);
        
        return data;

    } catch (error) {
        console.error("Error while fetching rejected mold data: ", error);
        throw error;
    }
});

// Thunk to delete rejected mold data
export const fetchToDeleteRejectedMould = createAsyncThunk('mouldRejection/fetchToDeleteRejectedMould', async (id) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteRejectedMould/${id}`;
        // const url = ``;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete rejected mold data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting rejected mold data: ", error);
        throw error;
    }
});


const mouldRejectionSlice = createSlice({
    name: "moulRejection",
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        

            // For fetching rejected mold data
            .addCase(fetchToGetRejectedMouldData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToGetRejectedMouldData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToGetRejectedMouldData.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting rejected mold data
            .addCase(fetchToDeleteRejectedMould.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteRejectedMould.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteRejectedMould.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

       
    },
});

export default mouldRejectionSlice.reducer;
