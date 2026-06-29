import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getAllRecipes, setCat, viewRecipe } from "../../features/menuSlice";
import { getAllCategories } from "../../features/customuseSlice";
import { useNavigate } from "react-router-dom";
import { setView } from "../../features/usersSlice";
import UserView from "../../components/UserView";
import { addToCart } from "../../features/cartSlice";
import { setNotification } from "../../features/notificationSlice";
import { CiHeart } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

export default function Menu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { loadingRecipes, recipes, cat } = useSelector(
    (state) => state.menuSlice
  );

  const { categories, loadingCategories } = useSelector(
    (state) => state.customuseSlice
  );

  const { view } = useSelector((state) => state.usersSlice);

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      let updated;
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      } else {
        updated = [...prev, productId];
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const filteredRecipes = recipes?.filter((recipe) => {
    const text = search.toLowerCase();
    const matchesSearch =
      recipe.name?.toLowerCase().includes(text) ||
      recipe.description?.toLowerCase().includes(text) ||
      recipe.Category?.toLowerCase().includes(text);
    const matchesCategory = cat === "All" || recipe.Category === cat;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    dispatch(getAllRecipes());
    dispatch(getAllCategories());
  }, [dispatch]);

  if (view) {
    return <UserView />;
  }

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">
          Our Menu
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Choose from a variety of delicious meals made just for you.
        </p>

        {/* Search */}
        <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] w-full max-w-sm focus-within:border-accent transition-colors duration-150">
          <CiSearch className="text-[var(--color-muted)] text-xl shrink-0" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
          />
        </div>
      </motion.div>

      {/* ── Categories ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => dispatch(setCat("All"))}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 cursor-pointer
            ${cat === "All"
              ? "bg-accent text-white border-accent"
              : "bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-border)] hover:border-accent hover:text-accent"
            }`}
        >
          All
        </motion.button>

        {loadingCategories
          ? [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-[var(--color-card)] animate-pulse rounded-full"
              />
            ))
          : categories?.length > 0
          ? categories.map((i, index) => (
              <motion.button
                key={i._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => dispatch(setCat(i.name))}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 cursor-pointer
                  ${cat === i.name
                    ? "bg-accent text-white border-accent"
                    : "bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-border)] hover:border-accent hover:text-accent"
                  }`}
              >
                {i.name.charAt(0).toUpperCase() + i.name.slice(1)}
              </motion.button>
            ))
          : <p className="text-sm text-[var(--color-muted)]">No categories found</p>
        }
      </div>

      {/* ── Grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
      >
        {/* Skeletons */}
        {loadingRecipes &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[140px] lg:h-[340px] w-full rounded-2xl bg-[var(--color-card)] animate-pulse"
            />
          ))}

        {/* Cards */}
        {!loadingRecipes &&
          filteredRecipes?.map((recipe, index) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="
                flex flex-row lg:flex-col
                w-full
                overflow-hidden
                rounded-2xl
                bg-[var(--color-card)]
                border border-[var(--color-border)]
                hover:border-accent/40
                hover:shadow-md
                transition-all duration-200
              "
            >
              {/* Image */}
              <div
                className="
                  w-[120px] h-[120px] shrink-0 self-center m-2 rounded-xl overflow-hidden
                  lg:w-full lg:h-[200px] lg:m-0 lg:rounded-none lg:self-auto
                  cursor-pointer
                "
                onClick={() => dispatch(setView(recipe))}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${recipe.image}`}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col justify-between p-3 lg:p-4 flex-1 min-w-0">
                {/* Top row */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm lg:text-base font-semibold text-[var(--color-text)] leading-snug line-clamp-1">
                      {recipe.name}
                    </h3>
                    <button
                      onClick={() => toggleWishlist(recipe._id)}
                      className="shrink-0 p-1 rounded-full hover:bg-[var(--color-border)] transition-colors"
                      aria-label="Toggle wishlist"
                    >
                      <CiHeart
                        className={`text-xl transition-colors duration-150 ${
                          isInWishlist(recipe._id)
                            ? "text-red-500"
                            : "text-[var(--color-muted)]"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2 leading-relaxed hidden lg:block">
                    {recipe.description}
                  </p>

                  {/* Category badge — mobile only */}
                  <span className="lg:hidden inline-block mt-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-medium">
                    {recipe.Category}
                  </span>
                </div>

                {/* Bottom row: price + button */}
                <div className="flex items-center justify-between mt-2 lg:mt-4 gap-2">
                  <div>
                    <p className="text-[10px] text-[var(--color-muted)] leading-none mb-0.5">
                      {recipe.sizes?.[0]?.size}
                    </p>
                    <p className="text-base lg:text-lg font-bold text-accent leading-none">
                      {recipe.sizes?.[0]?.price}
                      <span className="text-xs font-normal ml-0.5">L.E</span>
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      dispatch(
                        addToCart({
                          _id: recipe._id,
                          name: recipe.name,
                          image: recipe.image,
                          size: recipe.sizes?.[0]?.size,
                          price: recipe.sizes?.[0]?.price,
                        })
                      );
                      dispatch(
                        setNotification({
                          message: `${recipe.name} added to cart`,
                          type: "success",
                        })
                      );
                    }}
                    className="shrink-0 bg-accent hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-colors duration-150"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* Empty state */}
      {!loadingRecipes && filteredRecipes?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">No dishes match your search.</p>
        </div>
      )}
    </div>
  );
}