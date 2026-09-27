import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk to reject a new Bag
export const fetchToRejectNewBag = createAsyncThunk('bagIncubation/fetchToRejectNewBag', async (dataOfRejectedBag) => {
    try {
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/rejectBag/new`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataOfRejectedBag),
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to reject the Bag.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while rejecting Bag: ", error);
        throw error;
    }
});
export const fetchBagIncubationData = createAsyncThunk('bagIncubation/fetchBagIncubationData',async(queryParams)=>{
try {
    const params = new URLSearchParams(queryParams)
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
    const url = `${BACK_HOST}api/v1/getBagIncubationData?${params}`;
    const response =  await fetch(url,{
        method:"GET",
        credentials:"include"
    });

    if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        throw new Error("Failed to fetch Data Of Incubation")
    }


    const data = await response.json();
    return data;    



} catch (error) {
    console.log("Bag Incubation Data Is Not Fetch, Some Error Is occur:- ",error);
}
})

export const fetchToDeleteBagIncubationData = createAsyncThunk('bagIncubation/fetchToDeleteBagIncubationData',async(id)=>{
    try {

            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteBagIncubationData/${id}`;

        const response = await fetch(url,{
            method:"DELETE",
            credentials:"include"
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error("Failed to Delete Data Of Incubation")
        }
        const details = await response.json();
        toast.success(details.message)
        return details
        
    } catch (error) {
        console.log("Bag Incubation Data Is Not Deleted, Some Error Is occur:- ",error);
    }
})


export const fetchToUpdateBagIncubationData = createAsyncThunk('bagIncubation/fetchToUpdateBagIncubationData',async({id,filledData})=>{
    // console.log("filledData",filledData);
    try {

    console.log("filledData",filledData);
            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/updateBagIncubationData/${id}`;

        const response = await fetch(url,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(filledData),
            credentials:"include"
        })

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error("Failed to update Data Of Incubation")
        }


        const details = await response.json();
        toast.success(details.message);
        return details
        
    } catch (error) {
        console.log("Bag Incubation Data Is Not Update, Some Error Is occur:- ",error);
    }
})

export const bagIncubationSlice = createSlice({
    name: "bagIncubation",
    initialState: {
        isLoading: false,
        data: null,
        isError: false,
        deleteDetails:null,
        updateDetails:null
    },

    reducer: {},
    extraReducers: (builder) => {
        //get
        builder.addCase(fetchBagIncubationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchBagIncubationData.fulfilled, (state, action) => {
            state.isLoading = false;
            // console.log("action.payload",action.payload);
            state.data = action.payload;
        }).addCase(fetchBagIncubationData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
        })

        //delete
        builder.addCase(fetchToDeleteBagIncubationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToDeleteBagIncubationData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.deleteDetails = action.payload;
        }).addCase(fetchToDeleteBagIncubationData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
        })


        //Update
        builder.addCase(fetchToUpdateBagIncubationData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToUpdateBagIncubationData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.updateDetails = action.payload;
        }).addCase(fetchToUpdateBagIncubationData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
        })
    }
})

export default bagIncubationSlice.reducer;