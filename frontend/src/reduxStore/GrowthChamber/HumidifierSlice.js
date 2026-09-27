import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const fetchHumidifiers = createAsyncThunk('growthChamber/fetchHumidifiers', async () => {
    try {
        const BACK_HOST = process.env.REACT_APP_SPRING_BACKEND;
        const url = `${BACK_HOST}api/v2s/chamber`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include'
        })
        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return errorData
        }

        const data = await response.json();
        if (data.chambers) {
            data.humidifiers = data.chambers;
        }
        return data

    } catch (error) {
        console.error("Unable to fetch humidifiers data ", error);
        throw error;
    }
})

// Update a chamber's status
export const updateChamberStatus = createAsyncThunk('growthChamber/updateChamberStatus', async ({ id, status }, { rejectWithValue }) => {
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

// export const addMouldAndUpdateHumidifer = createAsyncThunk('growthChamber/addMoulds', async (data) => {
//     try {
//         const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST_URL;
//         const url = `${BACK_HOST}humidifier/addMoulds`;
//         const response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: data
//         })
//         // console.log("response: ",response)
//         if (!response.ok) {
//             const errorData = await response.json();
//             toast.error(errorData.message);
//             return errorData
//             // throw new Error(errorData.message || "Failed to create a new bottle of jam.");
//         }
        
//         const data = await response.json();
//         toast.success(data.message)
//         return data

//     } catch (error) {
//         console.error("Error in adding moulds ", error);
//         throw error;
//     }
// })

const humidifierSlice = createSlice({
    name: "humidifiers",
    initialState: {
        data: null,
        isLoading: false,
        isError: false
    },
    reducers: {},
    extraReducers: (builder) => {

        // Fetch all humidifiers data
        builder.addCase(fetchHumidifiers.pending,(state)=>{
            state.isLoading = true;
        }).addCase(fetchHumidifiers.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchHumidifiers.rejected,(state,action)=>{
            console.log("Error", action.payload);
            state.isError = false;
            state.isLoading = false;
        })

        // Update chamber status
        builder.addCase(updateChamberStatus.pending, (state) => {
            state.isLoading = true;
        }).addCase(updateChamberStatus.fulfilled, (state) => {
            state.isLoading = false;
        }).addCase(updateChamberStatus.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
    }
})

export default humidifierSlice.reducer