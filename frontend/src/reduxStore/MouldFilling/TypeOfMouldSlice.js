import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to create a new Type of Mould
export const fetchToCreateNewTypeOfMould = createAsyncThunk('typeOfMould/fetchToCreateNewTypeOfMould', async (newTypeData) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/addNewTypeOfMould`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTypeData),
            credentials:'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            console.error(errorData.message || "Failed to create a new type of mould.");
            return errorData;
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while creating new type of mould: ", error);
        throw error;
    }
});

// Thunk to fetch Types of Mould
export const fetchToGetTypeOfMould = createAsyncThunk('typeOfMould/fetchToGetTypeOfMould', async () => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/getTypeOfMould`;
        const response = await fetch(url, {
            method: 'GET',
            credentials:'include'
        });

        console.log("response",response);
        console.count("Hii");
        
        if (!response.ok) {
            throw new Error("Failed to fetch types of mould.");
        }
        console.count("Hii");

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error while fetching types of mould: ", error);
        throw error;
    }
});

// Thunk to delete a Type of Mould
export const fetchToDeleteTypeOfMould = createAsyncThunk('typeOfMould/fetchToDeleteTypeOfMould', async (id) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteTypeOfMould/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials:'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete type of mould.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting type of mould: ", error);
        throw error;
    }
});

const typeOfMouldSlice = createSlice({
    name: "typeOfMould",
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // For new Type of Mould
            .addCase(fetchToCreateNewTypeOfMould.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToCreateNewTypeOfMould.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToCreateNewTypeOfMould.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching Types of Mould
            .addCase(fetchToGetTypeOfMould.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToGetTypeOfMould.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToGetTypeOfMould.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting Type of Mould
            .addCase(fetchToDeleteTypeOfMould.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteTypeOfMould.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteTypeOfMould.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default typeOfMouldSlice.reducer;
