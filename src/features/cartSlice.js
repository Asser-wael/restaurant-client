import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart: localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart"))
        : [],
};

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {
        addToCart: (state, action) => {
            const exist = state.cart.find(
                (item) =>
                    item._id === action.payload._id &&
                    item.size === action.payload.size
            );

            if (exist) {
                exist.count += 1;
            } else {
                state.cart.push({
                    ...action.payload,
                    count: 1,
                });
            }

            localStorage.setItem(
                "cart",
                JSON.stringify(state.cart)
            );
        },

        increase: (state, action) => {

            const exist = state.cart.find(
                (item) =>
                    item._id === action.payload._id &&
                    item.size === action.payload.size
            );
            if (!exist) return;


            exist.count += 1;

            localStorage.setItem(
                "cart",
                JSON.stringify(state.cart)
            );

        }
        ,
        decrease: (state, action) => {
            const exist = state.cart.find(
                (item) =>
                    item._id === action.payload._id &&
                    item.size === action.payload.size
            );

            if (!exist) return;

            if (exist.count > 1) {
                exist.count -= 1;
            } else {
                state.cart = state.cart.filter(
                    (item) =>
                        !(
                            item._id === action.payload._id &&
                            item.size === action.payload.size
                        )
                );
            }

            localStorage.setItem(
                "cart",
                JSON.stringify(state.cart)
            );
        }
        ,
        removeFromCart: (state, action) => {
            state.cart = state.cart.filter(
                (item, index) => index !== action.payload
            );

            localStorage.setItem(
                "cart",
                JSON.stringify(state.cart)
            );
        },

        clearCart: (state) => {
            state.cart = [];

            localStorage.removeItem("cart");
        },
    },
});

export const {
    addToCart,
    increase,
    decrease,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;