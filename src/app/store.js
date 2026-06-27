import { configureStore } from "@reduxjs/toolkit";
import notification from "../features/notificationSlice";
import authSlice from "../features/authSlice.js";
import usersSlice from "../features/usersSlice.js";
// import dashboardApi from "../features/dashboardApi";
import menuSlice from "../features/menuSlice";
import customuseSlice from "../features/customuseSlice";
import soundNotificationSlice from "../features/soundNotificationSlice";
import cartSlice from "../features/cartSlice";
import orderSlice from "../features/orderSlice";
// import tableSlice from "../features/tableSlice";


export const store = configureStore({
  reducer: {
    notification,
    authSlice,
    // dashboardApi,
    menuSlice,
    customuseSlice,
    orderSlice,
    // tableSlice,
    usersSlice,
    cartSlice,
    soundNotificationSlice
  },
});