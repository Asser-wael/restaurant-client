import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { setNotification } from "./notificationSlice";

//  GET 
export const adminDashboard = createAsyncThunk(
    "dash/adminDashboard",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.get("/admin/dashboard");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);


//  SLICE 
const dashboardSlice = createSlice({
    name: "dashboardSlice",

    initialState: {
        todayData: null,
        monthData: null,
        yearData: null,
        type: "month",
        loading: false,
        error: null,
    },

    reducers: {
        setMonth: (state, action) => {
            state.type = "month";
        },
        setday: (state, action) => {
            state.type = "day";
        },
        setyear: (state, action) => {
            state.type = "year";
        },
    },


    extraReducers: (builder) => {
        builder
            //  GET 
            .addCase(adminDashboard.pending, (state) => {
                state.loading = true;
            })
            .addCase(adminDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.todayData = action.payload.day;
                state.monthData = action.payload.month;
                state.yearData = action.payload.year;
                console.log(action.payload.year);
                
            })
            .addCase(adminDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { setMonth, setday, setyear } = dashboardSlice.actions;
export default dashboardSlice.reducer;


