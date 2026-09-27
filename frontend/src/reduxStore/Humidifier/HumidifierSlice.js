import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fetch all humidifiers
export const fetchAllHumidifiers = createAsyncThunk('humidifier/fetchAllHumidifiers', async (_, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/chamber`;

        // console.log("url fetchAllHumidifiers:- ",url);
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return rejectWithValue('Failed to fetch all humidifiers.');
        }

        const data = await response.json();
        return data.chambers;
    } catch (error) {
        console.error('Error while fetching all humidifiers: ', error);
        return rejectWithValue(error.message);
    }
});

// Add a new humidifier
export const addHumidifier = createAsyncThunk('humidifier/addHumidifier', async (humidifierData, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/chamber/admin/addChamber`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(humidifierData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return errorData
            // return rejectWithValue(errorData.message || 'Failed to add humidifier.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data;
    } catch (error) {
        console.error('Error while adding humidifier: ', error);
        return rejectWithValue(error.message);
    }
});

// Delete a humidifier
export const deleteHumidifier = createAsyncThunk('humidifier/deleteHumidifier', async (id, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/chamber/admin/deleteChamber/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to delete humidifier.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data.deleteResponse;
    } catch (error) {
        console.error('Error while deleting humidifier: ', error);
        return rejectWithValue(error.message);
    }
});

// Update a chamber's status
export const updateChamberStatus = createAsyncThunk('humidifier/updateChamberStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/chamber/${id}/status?status=${status}`;

        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to update chamber status.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data;
    } catch (error) {
        console.error('Error while updating chamber status: ', error);
        return rejectWithValue(error.message);
    }
});

// Update a humidifier
export const updateHumidifier = createAsyncThunk('humidifier/updateHumidifier', async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/humidifier`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...updatedData }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to update humidifier.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data.updatedHumidifier;
    } catch (error) {
        console.error('Error while updating humidifier: ', error);
        return rejectWithValue(error.message);
    }
});


// Add reading data
export const addReadingData = createAsyncThunk('humidifier/addReadingData', async ({ id, readingData }, { rejectWithValue }) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/humidifier/moulds?id=${id}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(readingData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return rejectWithValue(errorData.message || 'Failed to add reading data.');
        }

        const data = await response.json();
        toast.success(data.message);
        return data.addedMouldsData;
    } catch (error) {
        console.error('Error while adding reading data: ', error);
        return rejectWithValue(error.message);
    }
});

export const getAddedMouldsData = createAsyncThunk('humidifier/getAddedMouldsData', async ({ humidifier }) => {
    // console.log("humidifier: Slice: 1" , humidifier);
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/humidifier/dataInHumidifier/${humidifier.dataId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return errorData
        }

        const res = await response.json();
        // console.log("Added mould data :", res);
        // setAddedMouldsData(res.data);
        // toast.success(res.message);
        return res;
    } catch (error) {
        console.error("Error in fetching moulds data", error);
        throw error;
    }
});




// Initial state
const initialState = {
    data: null,
    isLoading: false,
    isError: false,
};

// Humidifier slice
const humidifierSlice = createSlice({
    name: 'humidifier',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all humidifiers
            .addCase(fetchAllHumidifiers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllHumidifiers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllHumidifiers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })
            // Add humidifier
            .addCase(addHumidifier.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addHumidifier.fulfilled, (state, action) => {
                state.isLoading = false;
                ;
            })
            .addCase(addHumidifier.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })
            // Delete humidifier
            .addCase(deleteHumidifier.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteHumidifier.fulfilled, (state, action) => {
                state.isLoading = false;

            })
            .addCase(deleteHumidifier.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })
            // Update humidifier
            .addCase(updateHumidifier.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateHumidifier.fulfilled, (state, action) => {
                state.isLoading = false;

            })
            .addCase(updateHumidifier.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })
            // Update chamber status
            .addCase(updateChamberStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateChamberStatus.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateChamberStatus.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            // Add reading data
            .addCase(addReadingData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addReadingData.fulfilled, (state, action) => {
                state.isLoading = false;

            })
            .addCase(addReadingData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })
        // Fetch Added Mould Data
        builder.addCase(getAddedMouldsData.pending, (state) => {
            state.isLoading = true;
        })
            .addCase(getAddedMouldsData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;

            })
            .addCase(getAddedMouldsData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export default humidifierSlice.reducer;
