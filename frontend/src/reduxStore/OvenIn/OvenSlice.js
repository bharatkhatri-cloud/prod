import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to add a new oven
export const fetchToAddNewOven = createAsyncThunk('oven/fetchToAddNewOven', async (newOvenData, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/addNewOven`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newOvenData),
            credentials: 'include'
        });
        console.log("newOvenData: 2",response);
        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            console.error(errorData.message || 'Failed to add new oven.')
            return errorData
            // return rejectWithValue(errorData.message || 'Failed to add new oven.');
        }
        const data = await response.json();
        console.log("newOvenData: 3",data);
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error('Error while adding new oven: ', error);
        return rejectWithValue(error.message);
    }
});

// Thunk to fetch all ovens
export const fetchAllOvens = createAsyncThunk('oven/fetchAllOvens', async (_, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
        const url = `${BACK_HOST}api/v2s/oven-ops/all-ovens`;
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        console.log("oven",response);
        

        if (!response.ok) {
            throw new Error('Failed to fetch all ovens.');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error while fetching all ovens: ', error);
        return rejectWithValue(error.message);
    }
});

// Thunk to delete an oven by ID
export const fetchToDeleteOven = createAsyncThunk('oven/fetchToDeleteOven', async (id, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteOven/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            console.error(errorData.message || 'Failed to delete oven.')
            return errorData
            // return rejectWithValue(errorData.message || 'Failed to delete oven.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error('Error while deleting oven: ', error);
        return rejectWithValue(error.message);
    }
});

// Thunk to fetch batches for a specific oven by serial number
export const fetchOvenBatches = createAsyncThunk('oven/fetchOvenBatches', async (serialNo, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
        const url = `${BACK_HOST}api/v2s/oven-ops/batches?serialNo=${serialNo}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch oven batches.');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error while fetching oven batches: ', error);
        return rejectWithValue(error.message);
    }
});

const ovenSlice = createSlice({
    name: 'oven',
    initialState: {
        data: null,
        batches: [],
        isLoading: false,
        isError: false,
        isBatchesLoading: false,
        isBatchesError: false,
    },
    reducers: {
        clearOvenBatches: (state) => {
            state.batches = [];
            state.isBatchesLoading = false;
            state.isBatchesError = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // For adding new oven
            .addCase(fetchToAddNewOven.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToAddNewOven.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToAddNewOven.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching all ovens
            .addCase(fetchAllOvens.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllOvens.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllOvens.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting an oven
            .addCase(fetchToDeleteOven.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteOven.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteOven.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching oven batches
            .addCase(fetchOvenBatches.pending, (state) => {
                state.isBatchesLoading = true;
                state.isBatchesError = false;
            })
            .addCase(fetchOvenBatches.fulfilled, (state, action) => {
                state.isBatchesLoading = false;
                state.batches = action.payload;
            })
            .addCase(fetchOvenBatches.rejected, (state, action) => {
                state.isBatchesLoading = false;
                state.isBatchesError = true;
            });
    },
});

export const { clearOvenBatches } = ovenSlice.actions;
export default ovenSlice.reducer;
