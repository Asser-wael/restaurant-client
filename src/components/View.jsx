import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearRecipe } from "../features/menuSlice";
import { motion } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";

export default function View() {
  const dispatch = useDispatch();

  const { selectedRecipe } = useSelector(
    (state) => state.menuSlice
  );

  if (!selectedRecipe) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">
          No meal selected
        </h2>
      </div>
    );
  }

  console.log();

  return (
    <div className="p-4 md:p-6">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-5">
        <button
          onClick={() => dispatch(clearRecipe())}
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

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="
          max-w-6xl
          mx-auto
          overflow-hidden
          rounded-2xl
          md:rounded-3xl
          bg-[var(--color-card)]
          shadow-2xl
        "
      >
        {/* Cover */}
        <div className="relative">
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${selectedRecipe.image}`}
            alt={selectedRecipe.name}
            className="
              w-full
              h-[220px]
              sm:h-[300px]
              md:h-[400px]
              lg:h-[500px]
              object-cover
            "
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              {selectedRecipe.name}
            </h1>

            {selectedRecipe.offer && (
              <span className="inline-block mt-3 px-4 py-2 rounded-full bg-red-500 text-white font-medium">
                🔥 Special Offer
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--color-bg)] rounded-2xl p-5">
              <p className="text-sm text-gray-500">Available Sizes</p>

              <h3 className="text-3xl font-bold mt-2">
                {
                  selectedRecipe.sizes?.filter(
                    (s) => s.price !== null && s.price !== ""
                  ).length
                }
              </h3>
            </div>

            <div className="bg-[var(--color-bg)] rounded-2xl p-5">
              <p className="text-sm text-gray-500">Offer Status</p>

              <h3 className="text-3xl font-bold mt-2">
                {selectedRecipe.offer ? "Yes" : "No"}
              </h3>
            </div>
            <div className="bg-[var(--color-bg)] rounded-2xl p-5">
              <p className="text-sm text-gray-500">Category</p>

              <h3 className="text-3xl font-bold mt-2">
                {selectedRecipe.Category}
              </h3>
            </div>


            <div className="bg-[var(--color-bg)] rounded-2xl p-5">
              <p className="text-sm text-gray-500">Availability</p>
              {selectedRecipe.availability ? (
                <h3 className="text-3xl font-bold mt-2 text-green-500">
                  Available
                </h3>
              ) : (
                <h3 className="text-3xl font-bold mt-2 text-red-500">
                  Not Available
                </h3>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text)]">
              Description
            </h2>

            <p className="leading-8 text-[var(--color-text)] opacity-80">
              {selectedRecipe.description}
            </p>
          </div>

          {/* Sizes */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text)]">
              Sizes & Prices
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {selectedRecipe.sizes
                ?.filter(
                  (size) =>
                    size.price !== null &&
                    size.price !== ""
                )
                .map((size, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="
                      flex justify-between items-center
                      p-5
                      rounded-2xl
                      bg-[var(--color-bg)]
                    "
                  >
                    <span className="font-semibold text-lg">
                      {size.size}
                    </span>

                    <span className="font-bold text-green-500 text-lg">
                      {size.price} EGP
                    </span>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Details */}
          <div className="border-t border-[var(--color-border)] pt-8">
            <h2 className="text-2xl font-bold mb-5 text-[var(--color-text)]">
              Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg)] p-5 rounded-2xl">
                <p className="text-sm text-gray-500 mb-2">
                  Created At
                </p>

                <h4 className="font-semibold">
                  {new Date(
                    selectedRecipe.createdAt
                  ).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </h4>
              </div>

              <div className="bg-[var(--color-bg)] p-5 rounded-2xl">
                <p className="text-sm text-gray-500 mb-2">
                  Last Updated
                </p>

                <h4 className="font-semibold">
                  {new Date(
                    selectedRecipe.updatedAt
                  ).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </h4>
              </div>

              <div className="bg-[var(--color-bg)] p-5 rounded-2xl md:col-span-2">
                <p className="text-sm text-gray-500 mb-2">
                  Meal ID
                </p>

                <h4 className="font-mono break-all">
                  {selectedRecipe._id}
                </h4>
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearRecipe())}
            className="w-full bg-[var(--color-muted)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Back
          </button>
        </div>

      </motion.div>
    </div>
  );
}