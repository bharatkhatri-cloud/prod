import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to reject a new LC
export const fetchToRejectNewLcBottle = createAsyncThunk('lcRejection/fetchToRejectNewLcBottle', async (dataOfRejectedLc) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/rejectNewLcBottle`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataOfRejectedLc),
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            console.error(errorData.message || "Failed to reject the LC.")
            return errorData
            // throw new Error(errorData.message || "Failed to reject the LC.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while rejecting LC: ", error);
        throw error;
    }
});

// Thunk to fetch LC rejection data
export const fetchToGetLcRejectionData = createAsyncThunk('lcRejection/fetchToGetLcRejectionData', async (queryParams) => {
    try {
        const params = new URLSearchParams(queryParams);
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/getAllDataOfRejectedLc?${params}`;
        const response = await fetch(url, {
            method: 'GET',
             credentials:"include"
        });

        if (!response.ok) {
            throw new Error("Failed to fetch LC rejection data.");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error while fetching LC rejection data: ", error);
        throw error;
    }
});

// Thunk to delete LC rejection data
export const fetchToDeleteLcRejectionData = createAsyncThunk('lcRejection/fetchToDeleteLcRejectionData', async (id) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteTheDataOfRejectedLc/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
             credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete LC rejection data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting LC rejection data: ", error);
        throw error;
    }
});



// Thunk to update LC rejection data
export const fetchToUpdateLcRejectionData = createAsyncThunk('lcRejection/fetchToUpdateLcRejectionData', async ({ id, updatedData }) => {
    try {

        console.log("updatedData",updatedData);
        
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateTheDataOfRejectedLc/${id}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
             credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to update LC rejection data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while updating LC rejection data: ", error);
        throw error;
    }
});

const lcRejectionSlice = createSlice({
    name: "lcRejection",
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // For rejecting new LC
            .addCase(fetchToRejectNewLcBottle.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToRejectNewLcBottle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToRejectNewLcBottle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching LC rejection data
            .addCase(fetchToGetLcRejectionData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToGetLcRejectionData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToGetLcRejectionData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting LC rejection data
            .addCase(fetchToDeleteLcRejectionData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteLcRejectionData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteLcRejectionData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For updating LC rejection data
            .addCase(fetchToUpdateLcRejectionData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToUpdateLcRejectionData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToUpdateLcRejectionData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default lcRejectionSlice.reducer;
