import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { IoFastFoodOutline } from "react-icons/io5";

import Loading from "../../components/loading";

import { setNotification } from "../../features/notificationSlice";
import { motion } from "framer-motion";

import {
    addNewCategory,
    getAllCategories,
    deleteCategory,
    addPopular,
    deletePopular,
    getPopularDishes,
    getOffers,
} from "../../features/customuseSlice";

import { getAllRecipes } from "../../features/menuSlice";

export default function Customuse() {
    const dispatch = useDispatch();
    const { register, handleSubmit, reset } = useForm();

    const [image, setImage] = useState(null);

    const { categories, PopularDishes } = useSelector(
        (state) => state.customuseSlice
    );

    const { recipes, loadingRecipes } = useSelector(
        (state) => state.menuSlice
    );

    const {
        loadingCategories,
        loadingPopular,
        loadingCreateCategory,
        loadingDeleteCategory,
        loadingAddPopular,
        loadingDeletePopular,
    } = useSelector((state) => state.customuseSlice);

    useEffect(() => {
        dispatch(getAllRecipes());
        dispatch(getAllCategories());
        dispatch(getPopularDishes());
    }, [dispatch]);

    const onSubmit = async (data) => {
        const exist = categories?.some((i) => i.name === data.name);

        if (!image) {
            return dispatch(
                setNotification({ message: "Image is required", type: "error" })
            );
        }

        if (exist) {
            return dispatch(
                setNotification({ message: "Category already exists", type: "error" })
            );
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("image", image);

        const res = await dispatch(addNewCategory(formData));

        if (res.payload) {
            reset();
            setImage(null);
            dispatch(getAllCategories());
        }
    };

    const handleDeleteCategory = async (id) => {
        await dispatch(deleteCategory(id));
        dispatch(getAllCategories());
    };

    const popularIds = PopularDishes?.map((p) => p.id?._id);

    const popularList = recipes?.filter((r) =>
        popularIds?.includes(r._id)
    );

    const normalList = recipes?.filter(
        (r) => !popularIds?.includes(r._id)
    );

    const handleAddPopular = (id) => {
        dispatch(addPopular(id)).then(() => {
            dispatch(getPopularDishes());
        });
    };

    const handleRemovePopular = (id) => {
        dispatch(deletePopular(id)).then(() => {
            dispatch(getPopularDishes());
        });
    };
    const isLoading =
        loadingCategories ||
        loadingPopular ||
        loadingCreateCategory ||
        loadingDeleteCategory ||
        loadingAddPopular ||
        loadingDeletePopular;
    if (isLoading) return <Loading />;
    if (loadingRecipes || loadingCategories) return <Loading />;

    return (
        <motion.div className="p-6 space-y-14 bg-[var(--color-bg)] min-h-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}

            >
            {/* CREATE CATEGORY */}
            <section className="max-w-2xl mx-auto">
                <div className="bg-[var(--color-card)] p-8 rounded-3xl shadow-lg border border-[var(--color-border)]">
                    <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
                        Create Category
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <input
                            {...register("name", { required: true })}
                            placeholder="Category name"
                            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent outline-none"
                        />

                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent"
                        />

                        <button className="w-full bg-orange-500 hover:bg-orange-600 transition text-white py-3 rounded-xl font-semibold">
                            Create Category
                        </button>
                    </form>
                </div>
            </section>

            {/* CATEGORIES */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
                    📁 Categories
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {categories?.map((cat) => (
                        <div
                            key={cat._id}
                            className="relative bg-[var(--color-card)] p-4 rounded-2xl shadow-md border border-[var(--color-border)] flex flex-col items-center text-center"
                        >
                            <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="absolute top-3 right-3 text-red-500 hover:scale-110 transition"
                            >
                                <FaTrash />
                            </button>

                            {cat.image ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${cat.image}`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <IoFastFoodOutline className="text-4xl text-orange-500" />
                            )}

                            <h3 className="mt-3 font-semibold text-[var(--color-text)]">
                                {cat.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* POPULAR */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
                    🔥 Popular Dishes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
                    {popularList?.map((item) => (
                        <div
                            key={item._id}
                            className="bg-[var(--color-card)] rounded-2xl overflow-hidden shadow-md border border-[var(--color-border)]"
                        >
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                                className="w-full h-52 object-cover"
                            />

                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-3 text-[var(--color-text)]">
                                    {item.name}
                                </h3>

                                <button
                                    onClick={() => handleRemovePopular(item._id)}
                                    className="w-full bg-red-500 hover:bg-red-600 transition text-white py-2 rounded-xl"
                                >
                                    Remove from Popular
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ALL MEALS */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
                    🍽️ All Meals
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {normalList?.map((item) => (
                        <div
                            key={item._id}
                            className="bg-[var(--color-card)] rounded-2xl overflow-hidden shadow-md border border-[var(--color-border)]"
                        >
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                                className="w-full h-52 object-cover"
                            />

                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-3 text-[var(--color-text)]">
                                    {item.name}
                                </h3>

                                <button
                                    onClick={() => handleAddPopular(item._id)}
                                    className="w-full bg-orange-500 hover:bg-orange-600 transition text-white py-2 rounded-xl"
                                >
                                    Add to Popular
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </motion.div>
    );
}