import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to create a new LC
export const fetchToPrepareNewLc = createAsyncThunk('lcPreparation/fetchToPrepareNewLc', async (dataOfNewLc) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/prepareNewLc`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataOfNewLc),
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            console.error(errorData.message || "Failed to create a new LC.")
            return errorData
            // throw new Error(errorData.message || "Failed to create a new LC.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while preparing new LC: ", error);
        throw error;
    }
});

// Thunk to fetch LC preparation data
export const fetchLcPreparationData = createAsyncThunk('lcPreparation/fetchLcPreparationData', async (queryParams) => {
    let loadingToastId;
    try {
        const params = new URLSearchParams(queryParams);
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/getAllDataOfPreparedLc?${params}`;
        loadingToastId = toast.loading("loading...");
        console.log("Lc Preparation Get Data URL",url);
        console.count("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.update(loadingToastId, {
                render: errorData.message,
                type: "error",
                isLoading: false,
                autoClose: 5000, // Closes automatically after 5 seconds
              });
            throw new Error("Failed to fetch LC preparation data.");
        }

        const data = await response.json();
        toast.update(loadingToastId, {
            render: data.message,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
        return data;

    } catch (error) {
        console.error("Error while fetching LC preparation data: ", error);
        throw error;
    }
});

// Thunk to delete LC preparation data
export const fetchToDeleteLcPreparationData = createAsyncThunk('lcPreparation/fetchToDeleteLcPreparationData', async (id) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteTheDataOfPreparedLc/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete LC preparation data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting LC preparation data: ", error);
        throw error;
    }
});


const lcPreparationSlice = createSlice({
    name: "lcPreparation",
    initialState: {
        data: null,
        isLoading: false,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // For new LC preparation
            .addCase(fetchToPrepareNewLc.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToPrepareNewLc.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToPrepareNewLc.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For fetching LC preparation data
            .addCase(fetchLcPreparationData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchLcPreparationData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchLcPreparationData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            // For deleting LC preparation data
            .addCase(fetchToDeleteLcPreparationData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchToDeleteLcPreparationData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchToDeleteLcPreparationData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

           
    },
});

export default lcPreparationSlice.reducer;
