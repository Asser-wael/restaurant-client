import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

// ─── thunk ──────────────────────────────────────────────────────────────────

export const adminDashboard = createAsyncThunk(
  "dashboardSlice/adminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/dashboard");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ─── slice ───────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboardSlice",

  initialState: {
    todayData:  null,   // { revenue, orders, users, products, pendingOrders, avgOrderValue, returnRate, chart[] }
    monthData:  null,
    yearData:   null,
    type:       "month",   // "day" | "month" | "year"
    loading:    false,
    error:      null,
  },

  reducers: {
    setday:   state => { state.type = "day";   },
    setMonth: state => { state.type = "month"; },
    setyear:  state => { state.type = "year";  },
  },

  extraReducers: builder => {
    builder
      .addCase(adminDashboard.pending, state => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(adminDashboard.fulfilled, (state, { payload }) => {
        state.loading   = false;
        state.todayData = payload.day;
        state.monthData = payload.month;
        state.yearData  = payload.year;
      })
      .addCase(adminDashboard.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export const { setday, setMonth, setyear } = dashboardSlice.actions;
export default dashboardSlice.reducer;