import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { clearView } from "../features/usersSlice";

import {
    FaArrowLeft,
    FaBowlFood,
    FaTag,
    FaCircleCheck,
    FaCircleXmark,
} from "react-icons/fa6";
import { setNotification } from "../features/notificationSlice";
import { addToCart } from "../features/cartSlice";

export default function UserView() {
    const dispatch = useDispatch();

    const { view } = useSelector((state) => state.usersSlice);

    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        if (view?.sizes?.length) {
            setSelectedSize(view.sizes[0]);
        }
    }, [view]);

    if (!view) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[var(--color-bg)]"
        >
            <div className="max-w-7xl mx-auto px-4 py-6">
                <motion.button
                    whileHover={{ scale: 1.05, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(clearView())}
                    className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-[var(--color-card)]
            border border-[var(--color-border)]
            text-[var(--color-text)]
            shadow-sm
          "
                >
                    <FaArrowLeft />
                    Back
                </motion.button>
            </div>

            {/* Main */}
            <div className="max-w-7xl mx-auto px-4 pb-10">
                <div className="grid lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="
                        
              overflow-hidden
              rounded-3xl
              bg-[var(--color-card)]
              border border-[var(--color-border)]
              shadow-xl
            "
                    >
                        {view?.image ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${view.image}`}
                                alt={view.name}
                                className="
                  w-full
                  
                  object-cover
                  hover:scale-105
                  transition-all
                  duration-500
                "
                            />
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center">
                                <FaBowlFood
                                    size={90}
                                    className="text-[var(--color-muted)]"
                                />
                                <p className="mt-4 text-[var(--color-muted)]">
                                    No Image Available
                                </p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="
              bg-[var(--color-card)]
              rounded-3xl
              border border-[var(--color-border)]
              shadow-xl
              p-6 md:p-8
            "
                    >
                        <div className="flex items-center gap-3 flex-wrap">
                            <div
                                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-[var(--color-accent)]/10
                  text-[var(--color-accent)]
                "
                            >
                                <FaTag />
                                {view.Category}
                            </div>

                            {view.availability ? (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600">
                                    <FaCircleCheck />
                                    Available
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500">
                                    <FaCircleXmark />
                                    Not Available
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text)] mt-6">
                            {view.name}
                        </h1>

                        <p className="mt-6 text-[var(--color-muted)] leading-8">
                            {view.description}
                        </p>

                        <div className="mt-10">
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">
                                Choose Size
                            </h3>

                            <div className="flex flex-wrap gap-3">
                                {view?.sizes?.map((item, index) => (
                                    <motion.button
                                        key={index}
                                        disabled={item.price == null}
                                        whileHover={item.price != null ? { scale: 1.05 } : {}}
                                        whileTap={item.price != null ? { scale: 0.95 } : {}}
                                        onClick={() => setSelectedSize(item)}
                                        className={`
    px-5 py-3 rounded-2xl border font-medium transition-all

    ${item.price == null
                                                ? "opacity-40 cursor-not-allowed"
                                                : ""
                                            }

    ${selectedSize?.size === item.size
                                                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                                                : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
                                            }
  `}
                                    >
                                        {item.size}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            layout
                            className="
                mt-8
                p-6
                rounded-3xl
                bg-[var(--color-bg)]
                border border-[var(--color-border)]
              "
                        >
                            <p className="text-sm text-[var(--color-muted)]">
                                Selected Size
                            </p>

                            <h3 className="text-2xl font-bold text-[var(--color-text)] mt-1">
                                {selectedSize?.size}
                            </h3>

                            <div className="text-5xl font-black text-[var(--color-accent)] mt-3">
                                {selectedSize?.price} L.E
                            </div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!view.availability}
                            className="
                mt-8
                w-full
                py-4
                rounded-2xl
                bg-[var(--color-accent)]
                text-white
                font-bold
                text-lg
                shadow-lg
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
                            onClick={() => {
                                dispatch(
                                    addToCart({
                                        _id: view._id,
                                        name: view.name,
                                        image: view.image,
                                        size: selectedSize.size,
                                        price: selectedSize.price,
                                    })
                                );

                                dispatch(
                                    setNotification({
                                        message: "Added to cart",
                                        type: "success",
                                    })
                                );
                            }}
                        >
                            Add {selectedSize?.size} To Cart • {selectedSize?.price} L.E
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}