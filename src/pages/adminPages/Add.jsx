import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { addRecipe, getAllRecipes } from "../../features/menuSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { getAllCategories } from "../../features/customuseSlice";

export default function Add() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm();
    const { loadingAdd } = useSelector(
        (state) => state.menuSlice
    );
    const { categories } = useSelector(
        (state) => state.customuseSlice
    );

    const [image, setImage] = useState(null);
    const [sizes, setSizes] = useState([
        { size: "Small", price: "" },
        { size: "Medium", price: "" },
        { size: "Large", price: "" },
    ]);
    /// i
    const handleSizeChange = (index, value) => {
        const updated = [...sizes];
        updated[index].price = value;
        setSizes(updated);
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        console.log(data.Category);

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("offer", data.offer);
        formData.append("availability", data.availability);
        formData.append("Category", data.Category);
        formData.append("image", image);
        formData.append("sizes", JSON.stringify(sizes));

        const res = await dispatch(addRecipe(formData));

        if (res.payload) {
            reset();
            setImage(null);
            navigate("/admin/kitchen");
        }
    };

    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    if (loadingAdd) {
        return <Loading />
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full p-6 text-[var(--color-text)]"
        >
            <h1 className="text-3xl font-bold mb-6">Add New Recipe 🍽️</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)]"
            >

                <input
                    {...register("name", { required: true })}
                    placeholder="Meal name"
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />

                <textarea
                    {...register("description", { required: true })}
                    placeholder="Description"
                    rows={4}
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />

                <select
                    {...register("offer")}
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent"
                >
                    <option value="false" className="text-black" >No Offer</option>
                    <option value="true" className="text-black">Offer Available</option>
                </select>
                <select
                    {...register("availability")}

                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent"
                >
                    <option value="false" className="text-black" >Not available</option>
                    <option value="true" className="text-black">Available</option>
                </select>
                <select
                    {...register("Category", { required: true })}
                    defaultValue=""
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent"
                >
                    <option value="" disabled>
                        Select category
                    </option>

                    {categories?.map((e) => (
                        <option key={e._id} value={e.name} className="text-black">
                            {e.name}
                        </option>
                    ))}
                </select>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-transparent"
                />

                {image && (
                    <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded-xl border"
                    />
                )}

                <div className="space-y-3">
                    <h2 className="font-semibold">Sizes & Prices</h2>

                    {sizes.map((s, index) => (
                        <div key={s.size} className="flex items-center gap-3">
                            <span className="w-20 text-sm text-[var(--color-muted)]">
                                {s.size}
                            </span>

                            <input
                                type="number"
                                placeholder="Price"
                                value={s.price}
                                onChange={(e) => handleSizeChange(index, e.target.value)}
                                className="flex-1 p-2 rounded-xl border border-[var(--color-border)] bg-transparent"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[var(--color-accent)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                    Create Recipe
                </button>
            </form>
        </motion.div>
    );
}