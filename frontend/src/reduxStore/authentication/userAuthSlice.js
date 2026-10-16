import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thunk for fetching Create a New User
export const fetchToCreateNewUser = createAsyncThunk('userAuth/fetchToCreateNewUser', async (newUserDetails) => {
  try {
    const BACK_HOST = (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/").endsWith("/") ? (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") : (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") + "/";
    const url = `${BACK_HOST}api/v1/admin/createNewUser`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserDetails),
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message);
      return errorData
    }
    const data = await response.json();
    toast.success(data.message);
    return data
  } catch (error) {
    console.error("Your are not login, Please login to access your profile: ", error);
    throw error;
  }
})


export const fetchToGetAllUser = createAsyncThunk('userAuth/fetchToGetAllUser', async () => {
  try {

    const BACK_HOST = (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/").endsWith("/") ? (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") : (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") + "/";
    const url = `${BACK_HOST}api/v1/admin/getAllUsers`;
    const response = await fetch(url, {
      method: "GET",
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message);
      return errorData
    }
    const data = await response.json();
    // console.log("data",data.usersData);
    return data
  } catch (error) {
    console.error("Your are not login, Please login to access your profile: ", error);
    throw error;
  }
})



export const fetchToDeleteUser = createAsyncThunk('userAuth/fetchToDeleteUser', async (id) => {
  try {

    const BACK_HOST = (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/").endsWith("/") ? (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") : (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") + "/";
    const url = `${BACK_HOST}api/v1/admin/userDelete/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message);
      return errorData
    }
    const data = await response.json();
    toast.success(data.message);
    return data
  } catch (error) {
    console.error("Your are not login, Please login to access your profile: ", error);
    throw error;
  }
})








// Thunk for fetching GET Profile
export const fetchToGetLoggedInUserDetails = createAsyncThunk('userAuth/fetchToGetLoggedInUserDetails', async () => {
  try {
    //   const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST_URL;
    const BACK_HOST = (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/").endsWith("/") ? (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") : (process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/") + "/";
    const url = `${BACK_HOST}api/v1/me`;
    const response = await fetch(url, {
      method: "GET",
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json();
      // toast.error(errorData.message);
      return errorData
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Your are not login, Please login to access your profile: ", error);
    throw error;
  }
})




// Thunk for fetching login api
export const fetchToLogin = createAsyncThunk('userAuth/fetchToLogin', async ({loginDetails}, { rejectWithValue }) => {
  try {
    //   const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST_URL;
    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST || '';
    const url = `${BACK_HOST}api/v1/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginDetails),
      credentials: 'include'
    })
    const data = await response.json();
    if (!response.ok || !data.success) {
      toast.error(data.message || "Failed to login");
      return rejectWithValue(data);
    }

    toast.success(data.message)
    return data
  } catch (error) {
    const errorMsg = error?.message || "Failed to login! try again latter";
    toast.error(errorMsg);
    console.error("Your are not login, Please login to access your profile:-", error);
    return rejectWithValue({ message: errorMsg, success: false });
  }
})


// Thunk for fetching login api
export const fetchToLogout = createAsyncThunk('userAuth/fetchToLogout', async () => {
  try {
    //   const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST_URL;
    const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
    const url = `${BACK_HOST}api/v1/logout`;
    const response = await fetch(url, {
      method: "GET",
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message);
      return errorData
    }
    const data = await response.json();
    toast.success(data.message)
    return data
  } catch (error) {
    console.error("Your are not login, Please login to access your profile:-", error);
    throw error;
  }
})









export const userAuthSlice = createSlice({
  name: "userAuth",

  initialState: {
    isLoading: false,
    user: null,
    isUserLoggedIn: false,
    allUser: null,
    isError: false,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isUserLoggedIn = false;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {

    builder.addCase(fetchToCreateNewUser.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToCreateNewUser.fulfilled, (state) => {
      state.isLoading = false;
    }).addCase(fetchToCreateNewUser.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });




    builder.addCase(fetchToGetAllUser.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToGetAllUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.allUser = action.payload;
    }).addCase(fetchToGetAllUser.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });





    builder.addCase(fetchToGetLoggedInUserDetails.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToGetLoggedInUserDetails.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    }).addCase(fetchToGetLoggedInUserDetails.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });



    builder.addCase(fetchToLogin.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isUserLoggedIn = !!(action.payload?.dhaDbTkn || action.payload?.dbToken);
      state.user = action.payload;
    }).addCase(fetchToLogin.rejected, (state, action) => {
      state.isLoading = false;
      console.log("Error", action.payload);
      state.isError = true;
    });


    builder.addCase(fetchToLogout.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchToLogout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isUserLoggedIn = false;
    }).addCase(fetchToLogout.rejected, (state, action) => {
      state.isLoading = false;
      state.user = null;
      state.isUserLoggedIn = false;
      console.log("Logout completed with error notice:", action.payload);
    });



  },
});

export const { logoutUser } = userAuthSlice.actions;
export default userAuthSlice.reducer;