import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// This tells the app where the backend server is located.
const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;

// This async function gets the notifications list from the backend server.
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 10, isRead, category } = {}) => {
    try {
      // Build the URL with page and limit parameters.
      let url = `${BACK_HOST}api/v2s/notifications?page=${page}&limit=${limit}`;
      if (isRead !== undefined && isRead !== null) {
        url += `&isRead=${isRead}`;
      }
      if (category && category !== "all") {
        url += `&category=${category}`;
      }

      // Fetch from the server using the logged-in cookie.
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to load notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading notifications:", error);
      throw error;
    }
  }
);

// This async function marks a notification as read or unread on the backend server.
export const toggleReadApi = createAsyncThunk(
  "notifications/toggleReadApi",
  async ({ id, isRead }) => {
    try {
      const url = `${BACK_HOST}api/v2s/notifications/${id}/read`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to change read status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error changing read status:", error);
      throw error;
    }
  }
);

// This async function tells the backend server to mark all notifications as read.
export const markAllReadApi = createAsyncThunk(
  "notifications/markAllReadApi",
  async () => {
    try {
      const url = `${BACK_HOST}api/v2s/notifications/mark-all-read`;
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }
);

// This async function deletes a notification from the backend server.
export const deleteNotificationApi = createAsyncThunk(
  "notifications/deleteNotificationApi",
  async (id) => {
    try {
      const url = `${BACK_HOST}api/v2s/notifications/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return id;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
);

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
    totalCount: 0,
    isLoading: false,
    isError: false,
  },
  reducers: {
    // This adds a new notification received live from the WebSocket to our list.
    addNotification: (state, action) => {
      // Put the new notification at the top of the list.
      state.list.unshift(action.payload);
      state.unreadCount += 1;
      state.totalCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle loading notifications.
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        // Set the state list, unread count, and total count.
        const responseData = action.payload;
        if (responseData && responseData.success) {
          state.list = responseData.list;
          state.unreadCount = responseData.unreadCount;
          state.totalCount = responseData.totalCount;
        }
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      // Handle marking a notification as read/unread.
      .addCase(toggleReadApi.fulfilled, (state, action) => {
        const updatedNotif = action.payload.notification;
        const index = state.list.findIndex((n) => n.id === updatedNotif.id);
        if (index !== -1) {
          const oldReadStatus = state.list[index].isRead;
          state.list[index] = updatedNotif;
          // Adjust unread count based on status change.
          if (oldReadStatus && !updatedNotif.isRead) {
            state.unreadCount += 1;
          } else if (!oldReadStatus && updatedNotif.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      // Handle marking all as read.
      .addCase(markAllReadApi.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      // Handle deleting a notification.
      .addCase(deleteNotificationApi.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const index = state.list.findIndex((n) => n.id === deletedId);
        if (index !== -1) {
          const wasUnread = !state.list[index].isRead;
          state.list = state.list.filter((n) => n.id !== deletedId);
          state.totalCount = Math.max(0, state.totalCount - 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
