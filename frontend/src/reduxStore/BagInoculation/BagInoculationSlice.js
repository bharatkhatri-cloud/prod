import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const fetchToInoculateNewBag = createAsyncThunk('bagInoculation/fetchToInoculateNewBag', async (dataOfNewBag) => {
  try {
      const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
      // const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST_URL;
      const url = `${BACK_HOST}api/v1/bagInoculation/new`;
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(dataOfNewBag),
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
      console.error("The new Ba is not prepared; something went wrong: ", error);
      throw error;
  }
})



// Thunk for fetching bag inoculation data
export const fetchBagInoculationData = createAsyncThunk(
  "bagInoculation/fetchBagInoculationData",
  async (queryParams) => {
    try {

      const params = new URLSearchParams(queryParams);

    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
      const url = `${BACK_HOST}api/v1/getBagInoculatedData?${params}`;
      const response = await fetch(url, {
        method: "GET",
        credentials:'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
          toast.error(errorData.message);
          throw new Error("Failed to fetch data of Bag Inoculation");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.log("Bag Inoculation Data Is Not Fetch Some Error Is occur:- ", error);
    }
  }
);

export const fetchDeletingBagInoculationData = createAsyncThunk(
  "bagInoculation/fetchDeletingBagInoculationData",
  async (id) => {
    try {
    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
      const url = `${BACK_HOST}api/v1/admin/deleteBagInoculatedData/${id}`;

      const response  =  await fetch(url, {
        method: "DELETE",
        credentials:'include'
      })
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        throw new Error(errorData.message || "Failed to Delete Bag inoculation Data.");
    }
    
    const data = await response.json();
    toast.success(data.message)
    return data
    } catch (error) {
      console.log("Bag Inoculation Data Is Not Delete Some Error Is occur:- ", error);
    }
  }
);



export const fetchToUpdateBagInoculationData = createAsyncThunk(
  "bagInoculation/fetchToUpdateBagInoculationData",
  async ({ id, filledData }) => {
    try {
      console.log("id",id);
      console.log("filledData",filledData);
    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
      const url = `${BACK_HOST}api/v1/admin/updateBagInoculatedData/${id}`;
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
        throw new Error(errorData.message || "Failed to Update Bag inoculation Data.");
    }
    
    const data = await response.json();
    toast.success(data.message)
    return data
    
    } catch (error) {
      console.log("Something Went Wrong , Bag Inoculation Data Is Not Save:- ", error);
    }
  }
);

export const bagInoculationSlice = createSlice({
  name: "bagInoculation",

  initialState: {
    isLoading: false,
    data: null,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addCase(fetchToInoculateNewBag.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToInoculateNewBag.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchToInoculateNewBag.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

    builder.addCase(fetchBagInoculationData.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchBagInoculationData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchBagInoculationData.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

    builder.addCase(fetchDeletingBagInoculationData.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchDeletingBagInoculationData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      }).addCase(fetchDeletingBagInoculationData.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });

    builder.addCase(fetchToUpdateBagInoculationData.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchToUpdateBagInoculationData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      }).addCase(fetchToUpdateBagInoculationData.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });
  },
});

export default bagInoculationSlice.reducer;