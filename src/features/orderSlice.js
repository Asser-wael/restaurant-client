import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { setNotification } from "./notificationSlice";
import { clearCart } from "./cartSlice";

export const getAdminOrders = createAsyncThunk(
    "order/getAdminOrders",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/admin/orders");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const getOrderById = createAsyncThunk(
    "order/getOrderById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/admin/orders/${id}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const checkOut = createAsyncThunk(
    "order/checkOut",
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const cart = localStorage.getItem("cart");
            const cartP = cart ? JSON.parse(cart) : [];

            if (!cart || cart.length === 0) {
                dispatch(
                    setNotification({
                        message: "The cart is empty",
                        type: "error",
                    })
                );
                return rejectWithValue("Cart is empty");
            }
            formData.append("cart", cart);

            const res = await api.post("/checkOut", formData);

            const oldOrders =
                JSON.parse(localStorage.getItem("orderTracking")) || [];

            const newOrder = {
                orderId: res.data.order._id,
                cart,
                status: "pending",
                time: new Date(),
            };

            oldOrders.push(newOrder);

            localStorage.setItem(
                "orderTracking",
                JSON.stringify(oldOrders)
            );

            dispatch(
                setNotification({
                    message: res.data.message,
                    type: res.data.type,
                })
            );
            dispatch(clearCart());

            return { order: res.data.order, newOrder };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "order/updateOrderStatus",
    async ({ id, status }, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.put("/updateOrderStatus", { id, status });

            dispatch(
                setNotification({
                    message: res.data.message,
                    type: res.data.type,
                })
            );
            dispatch(clearCart());
            return res.data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);


const orderSlice = createSlice({
    name: "orderSlice",

    initialState: {
        orders: [],
        OrderTracking: JSON.parse(localStorage.getItem("orderTracking")) || [],
        order: null,
        loading: false,
        error: null,
    },

    reducers: {
        updateTracking(state, action) {
            const { orderId, status } = action.payload;

            state.OrderTracking = state.OrderTracking.map((order) =>
                order.orderId === orderId
                    ? { ...order, status }
                    : order
            );

            localStorage.setItem(
                "orderTracking",
                JSON.stringify(state.OrderTracking)
            );
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(checkOut.fulfilled, (state, action) => {
                state.loading = false;
                state.OrderTracking = [
                    ...state.OrderTracking,
                    action.payload.newOrder,
                ];
            })
            .addCase(checkOut.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getAdminOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { updateTracking } = orderSlice.actions;
export default orderSlice.reducer;