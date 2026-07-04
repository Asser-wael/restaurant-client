import { createSlice } from "@reduxjs/toolkit";

// ✅ قراءة الكارت الابتدائي من localStorage بأمان
const getInitialCart = () => {
    try {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    } catch (err) {
        console.error("Failed to parse initial cart from localStorage:", err);
        return [];
    }
};

const initialState = {
    cart: getInitialCart(),
};

// ✅ حفظ الكارت في localStorage بأمان
const saveCart = (cart) => {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
        console.error("Failed to save cart to localStorage:", err);
    }
};

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {
        addToCart: (state, action) => {
            try {
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

                saveCart(state.cart);
            } catch (err) {
                console.error("addToCart reducer error:", err);
            }
        },

        increase: (state, action) => {
            try {
                const exist = state.cart.find(
                    (item) =>
                        item._id === action.payload._id &&
                        item.size === action.payload.size
                );
                if (!exist) return;

                exist.count += 1;

                saveCart(state.cart);
            } catch (err) {
                console.error("increase reducer error:", err);
            }
        },

        decrease: (state, action) => {
            try {
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

                saveCart(state.cart);
            } catch (err) {
                console.error("decrease reducer error:", err);
            }
        },

        removeFromCart: (state, action) => {
            try {
                state.cart = state.cart.filter(
                    (item, index) => index !== action.payload
                );

                saveCart(state.cart);
            } catch (err) {
                console.error("removeFromCart reducer error:", err);
            }
        },

        clearCart: (state) => {
            try {
                state.cart = [];

                try {
                    localStorage.removeItem("cart");
                } catch (err) {
                    console.error("Failed to remove cart from localStorage:", err);
                }
            } catch (err) {
                console.error("clearCart reducer error:", err);
            }
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