
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, deleteUser, changeStatus } from "../../features/usersSlice";
import { motion } from "framer-motion";
import { TiUserDeleteOutline } from "react-icons/ti";
import Forbidden from "../../components/forbidden";
import { getAllRecipes, removeRecipe, setIdToEdit, viewRecipe } from "../../features/menuSlice";
import { useNavigate } from "react-router-dom";
import { FaMoneyBills } from "react-icons/fa6";
import View from "../../components/View";
import Edit from "../../components/Edit";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
export default function Kitchen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loadingAdd, loadingRecipes, recipes, selectedRecipe, selectedRecipeToEdit, loadingEdit } = useSelector(
    (state) => state.menuSlice
  );


  // search ////////////////////////////////////////////
  const [search, setSearch] = useState("");
  const filteredUsers = recipes?.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    dispatch(getAllRecipes());

  }, [dispatch]);


  if (selectedRecipe) {
    return <View />
  }
  if (selectedRecipeToEdit) {
    return <Edit />
  }
  // if (user.role === "chef" || user.role === "cashier") {
  //   return <Forbidden />;
  // }
  return (
    <motion.div
      initial={{ opacity: 0, }}
      animate={{ opacity: 1, }}
      className="p-6  w-full">
      <div className="flex flex-col mb-5 md:flex-row md:items-center md:justify-between gap-4">



        {/* LEFT SECTION */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Meals
          </h1>

          <p className="text-sm text-[var(--color-muted)]">
            Manage your own meals
          </p>

          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 rounded-xl border border-[var(--color-border)] 
            bg-[var(--color-card)] text-[var(--color-text)] outline-none 
            focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* RIGHT BUTTON */}
        <button className="flex items-center gap-2 px-5 py-2 rounded-xl 
                bg-[var(--color-accent)] text-white font-medium 
                hover:opacity-90 transition shadow-md w-fit"
          onClick={() => navigate("add")}>

          + Add Meal
        </button>

      </div>
      <hr />
      {(loadingAdd || loadingRecipes || loadingEdit) && (
        <div className="flex flex-wrap gap-3 mt-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[320px] w-100 mx-6 bg-[var(--color-card)] animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}


      <div className="flex flex-wrap gap-3 mt-10">
        {(!loadingAdd && !loadingRecipes) &&
          filteredUsers.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item._id}
              className="w-[380px] overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-52">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                {item.offer && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Offer
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {item.name}
                </h2>

                <p className="text-[var(--color-text-secondary)] mt-2 line-clamp-2  break-all">
                  {item.description.slice(0, 120)}
                </p>

                {/* Sizes */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.sizes?.map((size, idx) => {
                    if (size.price !== null) {
                      return (
                        <div
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-[var(--color-bg)] border-l-2 border-green-800"
                        >

                          <span className="font-medium">{size.size}</span>
                          <span className="ml-2 text-green-500 ">
                            {size.price} EGP
                          </span>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-between items-center flex-wrap ">
                  <span className="text-sm text-gray-500 mb-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                 
                  <div className="flex gap-2  flex-wrap">

                    <button
                      onClick={() => dispatch(removeRecipe(item._id))}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                    >
                      <FiTrash2 size={18} />
                    </button>

                    <button
                      onClick={() => dispatch(viewRecipe(item._id))}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition"
                    >
                      <FiEye size={18} />
                    </button>

                    <button
                      onClick={() => dispatch(setIdToEdit(item._id))}
                      className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition"
                    >
                      <FiEdit2 size={18} />
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}