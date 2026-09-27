import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const fetchToPrepareNewJam = createAsyncThunk('jamPreparation/fetchToPrepareNewJam', async (dataOfNewJam) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/prepareNewJam`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataOfNewJam),
            credentials:'include'
        })

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return errorData
            // throw new Error(errorData.message || "Failed to create a new bottle of jam.");
        }
        
        const data = await response.json();
        toast.success(data.message)
        return data

    } catch (error) {
        console.error("The new jam is not prepared; something went wrong: ", error);
        throw error;
    }
})



export const fetchJamPreparationData = createAsyncThunk(
    'jamPreparation/fetchJamPreparationData',
    async (queryParams) => {
        try {

            const params = new URLSearchParams(queryParams)
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/getAllDataOfPreparedJam?${params}`;

            console.log("Jam Fetched url",url);
        
            const response = await fetch(url, {
                method: 'GET',
                credentials:'include'
            })

            if (!response.ok) {
                throw new Error("Failed to fetch Data Of Jam Preparation Data.");
            } else {
                const data = await response.json()
                return data;
            }

        } catch (error) {
            console.error("Jam preparation data is not fetched; some error occurred: ", error);
            throw error;
        }
    }

)

export const fetchToDeleteJamPreparationData = createAsyncThunk('jamPreparation/fetchToDeleteJamPreparationData', async (id) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteTheDataOfPreparedJam/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            credentials:'include'
        })

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            // return errorData
            throw new Error("Jam Preparation Data is not deleted Something error is occur:-", errorData)
        }
        else {
            const data = await response.json();
            toast.success(data.message)
            return data;
        }

    } catch (error) {
        console.error("Failed to delete jam preparation data; some error occurred: ", error);
        throw error;
    }
})

export const fetchToUpdateJamPreparationData = createAsyncThunk('jamPreparation/fetchToUpdateJamPreparationData', async ({ id, filledData }) => {
    try {
    
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateDataOfPreparedJam/${id}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(filledData),
            credentials:'include'
        })
        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            // return errorData
            throw new Error("Something went wrong, Jam Preparation Data Is not delete, Response:-", errorData)
        } else {
            const data = await response.json();
            toast.success(data.message)
            return data;
        }

    } catch (error) {
        console.error("Something went wrong; jam preparation data is not saved: ", error);
        throw error;

    }
})

const jampreparationSlice = createSlice({
    name: "jamPreparation",

    initialState: {
        data: null,
        isLoading: false,
        isError: false,

    },
    reducers: {},

    extraReducers: (builder) => {
        //For New jam Preparation
        builder.addCase(fetchToPrepareNewJam.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToPrepareNewJam.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchToPrepareNewJam.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = false;
            state.isLoading = false;
        })

        //For Get Jam Preparation Data
        builder.addCase(fetchJamPreparationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchJamPreparationData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchJamPreparationData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
            state.isLoading = false;
        })

        //For Delete jam Preparation Data
        builder.addCase(fetchToDeleteJamPreparationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToDeleteJamPreparationData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchToDeleteJamPreparationData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
            state.isLoading = false;
        })

        //For update jam Preparation Data
        builder.addCase(fetchToUpdateJamPreparationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToUpdateJamPreparationData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchToUpdateJamPreparationData.rejected, (state, action) => {
            // console.log("Error", action.payload);
            state.isError = true;
            state.isLoading = false;
        })


    }

})

export default jampreparationSlice.reducer