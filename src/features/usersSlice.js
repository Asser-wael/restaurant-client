import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { setNotification } from "./notificationSlice"

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.get("/admin/users");
      console.log(res.data);

      dispatch(
        setNotification({
          message: res.data.message,
          type: res.data.type,
        })
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/deleteUser/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const changeStatus = createAsyncThunk(
  "users/changeStatus",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`/admin/changeStatus/${id}`, {
        status,
      });

      dispatch(
        setNotification({
          message: res.data.message,
          type: res.data.type,
        })
      );

      return {
        id: res.data.id,
        status,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const usersSlice = createSlice({
  name: "usersSlice",
  initialState: {
    usersData: [],
      view: localStorage.getItem("view")
    ? JSON.parse(localStorage.getItem("view"))
    : null,
    loadingUsers: false,
    loadingDelete: false,
    loadingStatus: false,
    error: null,
  },


reducers: {
  setView: (state, action) => {
    state.view = action.payload;

    localStorage.setItem(
      "view",
      JSON.stringify(action.payload)
    );
  },

  clearView: (state) => {
    state.view = null;
    localStorage.removeItem("view");
  },
},
  extraReducers: (builder) => {
    builder

      // GET USERS
      .addCase(getAllUsers.pending, (state) => {
        state.loadingUsers = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.usersData = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      // changeStatus
      .addCase(changeStatus.pending, (state) => {
        state.loadingStatus = true;
      })
      .addCase(changeStatus.fulfilled, (state, action) => {
        state.loadingStatus = false;

        const user = state.usersData.find(
          (u) => u._id === action.payload.id
        );

        if (user) {
          user.status = action.payload.status;
        }
      })
      // DELETE
      .addCase(deleteUser.pending, (state) => {
        state.loadingDelete = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loadingDelete = false;
        state.usersData = state.usersData.filter(
          (user) => user._id !== action.payload
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingDelete = false;
        state.error = action.payload;
      });
  },
});
export const { setView, clearView } = usersSlice.actions;
export default usersSlice.reducer;