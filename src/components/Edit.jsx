import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { set, useForm } from "react-hook-form";
import { addRecipe, clearIdToEdit, editRecipe, getAllRecipes } from "../features/menuSlice";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";
import { IoArrowBack } from "react-icons/io5";
import { getAllCategories } from "../features/customuseSlice";


export default function Edit() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm();
    const { selectedRecipeToEdit, recipes } = useSelector(
        (state) => state.menuSlice
    );
    const { categories } = useSelector(
        (state) => state.customuseSlice
    );
    
    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

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

    const product = recipes?.find((p) => p._id === selectedRecipeToEdit);

    useEffect(() => {
        if (product) {
            setImage(product.image)

            setSizes([
                { size: "Small", price: product.sizes[0].price == null ? "" : product.sizes[0].price },
                { size: "Medium", price: product.sizes[1].price == null ? "" : product.sizes[1].price },
                { size: "Large", price: product.sizes[2].price == null ? "" : product.sizes[2].price },
            ])

            reset({
                name: product.name,
                description: product.description,
                offer: product.offer,
                availability: product.availability,
                Category:product.Category,
                image: product.image,
            })
        }
    }, [reset, selectedRecipeToEdit])

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("Category", data.Category);
        formData.append("offer", data.offer);
        if (typeof image != "string") { //chat
            formData.append("image", image);
        }
        formData.append("sizes", JSON.stringify(sizes));

        // console.log([...formData.entries()]);  chatttt

        const res = await dispatch(editRecipe({ formData, id: product._id }));

        if (res.payload) {
            reset();
            setImage(null);
            dispatch(clearIdToEdit())
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full p-6 text-[var(--color-text)]"
        >
            <div className="max-w-6xl mx-auto mb-5">
                <button
                    onClick={() => dispatch(clearIdToEdit())}
                    type="button"
                    className="
                        flex items-center gap-2
                        px-4 py-2
                        rounded-xl
                        bg-[var(--color-card)]
                        border border-[var(--color-border)]
                        text-[var(--color-text)]
                        hover:scale-105
                        transition-all
                        shadow-md
                      "
                >
                    <IoArrowBack size={18} />
                    Back
                </button>
            </div>
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
                        src={  // chatttt 
                            typeof image === "string"
                                ? `${import.meta.env.VITE_API_URL}/uploads/${image}`
                                : URL.createObjectURL(image)
                        }
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
                    Edit Recipe
                </button>
                <button
                    type="button"
                    onClick={() => dispatch(clearIdToEdit())}
                    className="w-full bg-[var(--color-muted)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                    Back
                </button>
            </form>
        </motion.div>
    );
}