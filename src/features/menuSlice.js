import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { setNotification } from "./notificationSlice";

//  GET 
export const getAllRecipes = createAsyncThunk(
    "menu/getAllRecipes",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.get("/getAllRecipes");
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

//  ADD 
export const addRecipe = createAsyncThunk(
    "menu/addRecipe",
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post("/addRecipe", formData);

            dispatch(
                setNotification({
                    message: res.data.message,
                    type: res.data.type,
                })
            );

            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

//  DELETE 
export const removeRecipe = createAsyncThunk(
    "menu/removeRecipe",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.delete(`/removeRecipe/${id}`);

            dispatch(
                setNotification({
                    message: res.data.message,
                    type: res.data.type,
                })
            );

            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// VIEW 
export const viewRecipe = createAsyncThunk(
    "menu/viewRecipe",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/viewRecipe/${id}`);

            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }

    }
);

//  EDIT 
export const editRecipe = createAsyncThunk(
    "menu/editRecipe",
    async ({ formData, id }, { rejectWithValue, dispatch }) => {
        try {
            
            const res = await api.put(`/editRecipe/${id}`, formData);

            dispatch(
                setNotification({
                    message: res.data.message,
                    type: res.data.type,
                })
            );

            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

//  SLICE 
const menuSlice = createSlice({
    name: "menuSlice",

    initialState: {
        recipes: [],
        cat:"All",
        selectedRecipe: null,
        selectedRecipeToEdit: null,

        loadingRecipes: false,
        loadingAdd: false,
        loadingDelete: false,
        loadingView: false,
        loadingEdit: false,

        error: null,
    },

    reducers: {
        clearRecipe: (state, action) => {
            state.selectedRecipe = null;
        },
        clearIdToEdit: (state, action) => {
            state.selectedRecipeToEdit = null;
        },
        setIdToEdit: (state, action) => {
            state.selectedRecipeToEdit = action.payload;
            
        },
        setCat: (state, action) => {
            state.cat = action.payload;
            
        },


    },


    extraReducers: (builder) => {
        builder

            //  GET 
            .addCase(getAllRecipes.pending, (state) => {
                state.loadingRecipes = true;
            })
            .addCase(getAllRecipes.fulfilled, (state, action) => {
                state.loadingRecipes = false;
                state.recipes = action.payload;
            })
            .addCase(getAllRecipes.rejected, (state, action) => {
                state.loadingRecipes = false;
                state.error = action.payload;
            })

            //  ADD 
            .addCase(addRecipe.pending, (state) => {
                state.loadingAdd = true;
            })
            .addCase(addRecipe.fulfilled, (state, action) => {
                state.loadingAdd = false;
                state.recipes.push(action.payload);
            })
            .addCase(addRecipe.rejected, (state, action) => {
                state.loadingAdd = false;
                state.error = action.payload;
            })

            //  DELETE
            .addCase(removeRecipe.pending, (state) => {
                state.loadingDelete = true;
            })
            .addCase(removeRecipe.fulfilled, (state, action) => {
                state.loadingDelete = false;

                state.recipes = state.recipes.filter(
                    (recipe) => recipe._id !== action.payload
                );
            })
            .addCase(removeRecipe.rejected, (state, action) => {
                state.loadingDelete = false;
                state.error = action.payload;
            })

            //  VIEW 
            .addCase(viewRecipe.pending, (state) => {
                state.loadingView = true;
            })
            .addCase(viewRecipe.fulfilled, (state, action) => {
                state.loadingView = false;
                state.selectedRecipe = action.payload;
                console.log(state.selectedRecipe);

            })
            .addCase(viewRecipe.rejected, (state, action) => {
                state.loadingView = false;
                state.error = action.payload;

            })
            // EDIT 
            .addCase(editRecipe.pending, (state) => {
                state.loadingEdit = true;
            })
            .addCase(editRecipe.fulfilled, (state, action) => {
                state.loadingEdit = false;

                const index = state.recipes.findIndex(
                    (recipe) => recipe._id === action.payload._id
                );

                if (index !== -1) {
                    state.recipes[index] = action.payload;
                }

                if (state.selectedRecipe?._id === action.payload._id) {
                    state.selectedRecipe = action.payload;
                }
            })
            .addCase(editRecipe.rejected, (state, action) => {
                state.loadingEdit = false;
                state.error = action.payload;
            });
    },
});

export const {  clearRecipe , clearIdToEdit, setIdToEdit,setCat} = menuSlice.actions;
export default menuSlice.reducer;