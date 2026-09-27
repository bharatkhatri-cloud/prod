import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;

// Thunks for fetching data of various modules
export const fetchDataOfAllModules = createAsyncThunk(
  "dashboard/fetchDataOfAllModules",
  async (queryParams, { rejectWithValue }) => {
    try {
      const springBackend = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
      const startDate = queryParams?.startDate || '';
      const endDate = queryParams?.endDate || '';
      const url = `${springBackend}api/v2s/dashboard/dashboard-count?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch data of all modules");
        return rejectWithValue(errorData.message || "Failed to fetch data of all modules");
      }
      const data = await response.json();
      return { data, startDate, endDate };
    } catch (error) {
      console.log("Error fetching data of all modules:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDataOfLcModules = createAsyncThunk(
  "dashboard/fetchDataOfLcModules",
  async (queryParams, { rejectWithValue }) => {
    try {
      const springBackend = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
      const startDate = queryParams?.startDate || '';
      const endDate = queryParams?.endDate || '';
      const url = `${springBackend}api/v2s/dashboard/lc-analytics?fromDate=${startDate}&toDate=${endDate}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch LC modules data");
        return rejectWithValue(errorData.message || "Failed to fetch LC modules data");
      }

      const data = await response.json();
      return { data, startDate, endDate };
    } catch (error) {
      console.log("Error fetching data of LC modules:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDataOfBagModules = createAsyncThunk(
  "dashboard/fetchDataOfBagModules",
  async (queryParams, { rejectWithValue }) => {
    try {
      const springBackend = process.env.REACT_APP_SPRING_BACKEND || 'http://localhost:8080/';
      const startDate = queryParams?.startDate || '';
      const endDate = queryParams?.endDate || '';
      const url = `${springBackend}api/v2s/dashboard/bag-analytics?fromDate=${startDate}&toDate=${endDate}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch Bag modules data");
        return rejectWithValue(errorData.message || "Failed to fetch Bag modules data");
      }

      const data = await response.json();
      return { data, startDate, endDate };
    } catch (error) {
      console.log("Error fetching data of Bag modules:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDataOfMouldModules = createAsyncThunk(
  "dashboard/fetchDataOfMouldModules",
  async () => {
    try {
      const url = `${BACK_HOST}api/v1/admin/getDataOfMouldModules`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        throw new Error("Failed to fetch data of Mould modules");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching data of Mould modules:", error);
      throw error;
    }
  }
);

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    isLoading: false,
    isAllModulesLoading: false,
    isLcModulesLoading: false,
    isBagModulesLoading: false,
    isMouldModulesLoading: false,
    data: {
      allModuleData: {},
      lcModulesData: {},
      bagInoculationData: {},
      mouldModulesData: {},
    },
    cache: {}, // Holds cached allModuleData by key: 'startDate_endDate'
    lcCache: {}, // Holds cached lcModulesData by key: 'startDate_endDate'
    bagCache: {}, // Holds cached bagInoculationData by key: 'startDate_endDate'
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataOfAllModules.pending, (state, action) => {
        const startDate = action.meta.arg?.startDate || '';
        const endDate = action.meta.arg?.endDate || '';
        const cacheKey = `${startDate}_${endDate}`;
        if (state.cache[cacheKey]) {
          state.data = {
            ...state.data,
            allModuleData: state.cache[cacheKey]
          };
          state.isAllModulesLoading = false;
          state.isLoading = false;
        } else {
          state.isAllModulesLoading = true;
          state.isLoading = true;
        }
      })
      .addCase(fetchDataOfAllModules.fulfilled, (state, action) => {
        state.isAllModulesLoading = false;
        state.isLoading = false;
        const allModuleData = action.payload.data.allModuleData || {};
        const cacheKey = `${action.payload.startDate}_${action.payload.endDate}`;
        state.cache[cacheKey] = allModuleData;
        state.data = {
          ...state.data,
          allModuleData
        };
      })
      .addCase(fetchDataOfAllModules.rejected, (state, action) => {
        state.isAllModulesLoading = false;
        state.isLoading = false;
        state.isError = true;
        console.error("Error fetching data of all modules", action.error);
      });

    builder
      .addCase(fetchDataOfLcModules.pending, (state, action) => {
        const startDate = action.meta.arg?.startDate || '';
        const endDate = action.meta.arg?.endDate || '';
        const cacheKey = `${startDate}_${endDate}`;
        if (state.lcCache[cacheKey]) {
          state.data = {
            ...state.data,
            lcModulesData: state.lcCache[cacheKey]
          };
          state.isLcModulesLoading = false;
        } else {
          state.isLcModulesLoading = true;
        }
      })
      .addCase(fetchDataOfLcModules.fulfilled, (state, action) => {
        state.isLcModulesLoading = false;
        const lcData = action.payload.data || {};
        const cacheKey = `${action.payload.startDate}_${action.payload.endDate}`;
        state.lcCache[cacheKey] = lcData;
        state.data = {
          ...state.data,
          lcModulesData: lcData
        };
      })
      .addCase(fetchDataOfLcModules.rejected, (state, action) => {
        state.isLcModulesLoading = false;
        state.isError = true;
        console.error("Error fetching data of LC modules", action.payload || action.error);
      });

    builder
      .addCase(fetchDataOfBagModules.pending, (state, action) => {
        const startDate = action.meta.arg?.startDate || '';
        const endDate = action.meta.arg?.endDate || '';
        const cacheKey = `${startDate}_${endDate}`;
        if (state.bagCache[cacheKey]) {
          state.data = {
            ...state.data,
            bagInoculationData: state.bagCache[cacheKey]
          };
          state.isBagModulesLoading = false;
        } else {
          state.isBagModulesLoading = true;
        }
      })
      .addCase(fetchDataOfBagModules.fulfilled, (state, action) => {
        state.isBagModulesLoading = false;
        const bagData = action.payload.data || {};
        const cacheKey = `${action.payload.startDate}_${action.payload.endDate}`;
        state.bagCache[cacheKey] = bagData;
        state.data = {
          ...state.data,
          bagInoculationData: bagData
        };
      })
      .addCase(fetchDataOfBagModules.rejected, (state, action) => {
        state.isBagModulesLoading = false;
        state.isError = true;
        console.error("Error fetching data of Bag modules", action.payload || action.error);
      });

    builder
      .addCase(fetchDataOfMouldModules.pending, (state) => {
        state.isMouldModulesLoading = true;
      })
      .addCase(fetchDataOfMouldModules.fulfilled, (state, action) => {
        state.isMouldModulesLoading = false;
        state.data = {
          ...state.data,
          mouldModulesData: action.payload.mouldModulesData
        };
      })
      .addCase(fetchDataOfMouldModules.rejected, (state, action) => {
        state.isMouldModulesLoading = false;
        state.isError = true;
        console.error("Error fetching data of Mould modules", action.error);
      });
  },
});

export default dashboardSlice.reducer;
