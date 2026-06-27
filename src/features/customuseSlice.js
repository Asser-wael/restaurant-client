import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { setNotification } from "./notificationSlice";

export const getAllCategories = createAsyncThunk(
    "categories/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/getAllCategories");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);
export const getOffers = createAsyncThunk(
    "offers/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/getOffers");

            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const addNewCategory = createAsyncThunk(
    "categories/add",
    async (formdata, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post("/addNewCategory", formdata);

            dispatch(setNotification({
                message: res.data.message,
                type: res.data.type,
            }));

            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "categories/delete",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.delete(`/deleteCategory/${id}`);

            dispatch(setNotification({
                message: res.data.message,
                type: res.data.type,
            }));

            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const getPopularDishes = createAsyncThunk(
    "popular/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/getPopularDishs");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const addPopular = createAsyncThunk(
    "popular/add",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post("/addPopular", { id });

            dispatch(setNotification({
                message: res.data.message,
                type: res.data.type,
            }));

            return res.data.popularDish;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const deletePopular = createAsyncThunk(
    "popular/delete",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.delete(`/deletePopular/${id}`);

            dispatch(setNotification({
                message: res.data.message,
                type: res.data.type,
            }));

            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data);
        }
    }
);

const customuseSlice = createSlice({
    name: "customuse",
    initialState: {
        categories: [],
        offers: [],
        PopularDishes: [],
        loadingoffers: false,
        loadingCategories: false,
        loadingPopular: false,

        loadingCreateCategory: false,
        loadingDeleteCategory: false,

        loadingAddPopular: false,
        loadingDeletePopular: false,
    },


    
    extraReducers: (builder) => {
        builder

            .addCase(getAllCategories.pending, (state) => {
                state.loadingCategories = true;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.loadingCategories = false;
                state.categories = action.payload;
            })
            .addCase(getAllCategories.rejected, (state) => {
                state.loadingCategories = false;
            })
            .addCase(getOffers.pending, (state) => {
                state.loadingoffers = true;
            })
            .addCase(getOffers.fulfilled, (state, action) => {
                state.loadingoffers = false;
                state.offers = action.payload;

            })
            .addCase(getOffers.rejected, (state) => {
                state.loadingoffers = false;
            })

            .addCase(addNewCategory.pending, (state) => {
                state.loadingCreateCategory = true;
            })
            .addCase(addNewCategory.fulfilled, (state, action) => {
                state.loadingCreateCategory = false;
                state.categories.push(action.payload);
            })
            .addCase(addNewCategory.rejected, (state) => {
                state.loadingCreateCategory = false;
            })

            .addCase(deleteCategory.pending, (state) => {
                state.loadingDeleteCategory = true;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loadingDeleteCategory = false;
                state.categories = state.categories.filter(
                    (c) => c._id !== action.payload
                );
            })
            .addCase(deleteCategory.rejected, (state) => {
                state.loadingDeleteCategory = false;
            })

            .addCase(getPopularDishes.pending, (state) => {
                state.loadingPopular = true;
            })
            .addCase(getPopularDishes.fulfilled, (state, action) => {
                state.loadingPopular = false;
                state.PopularDishes = action.payload;
            })
            .addCase(getPopularDishes.rejected, (state) => {
                state.loadingPopular = false;
            })

            .addCase(addPopular.pending, (state) => {
                state.loadingAddPopular = true;
            })
            .addCase(addPopular.fulfilled, (state, action) => {
                state.loadingAddPopular = false;
                state.PopularDishes.push(action.payload);
            })
            .addCase(addPopular.rejected, (state) => {
                state.loadingAddPopular = false;
            })

            .addCase(deletePopular.pending, (state) => {
                state.loadingDeletePopular = true;
            })
            .addCase(deletePopular.fulfilled, (state, action) => {
                state.loadingDeletePopular = false;
                state.PopularDishes = state.PopularDishes.filter(
                    (p) => p._id !== action.payload
                );
            })
            .addCase(deletePopular.rejected, (state) => {
                state.loadingDeletePopular = false;
            });
    },
});
export default customuseSlice.reducer;