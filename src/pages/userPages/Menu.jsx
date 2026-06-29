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

    const matchesCategory =
      cat === "All" || recipe.Category === cat;

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
    <div>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="p-2 m-6"
      >
        <h1 className="text-4xl font-extrabold text-[var(--color-text)]">
          Our Menu
        </h1>

        <p className="text-[var(--color-muted)] mt-2 max-w-md">
          Choose from a variety of delicious meals made just for you.
        </p>

      <input
        type="text"
        placeholder="Search by Order ID or Table..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg my-3 border border-[var(--color-border)] bg-[var(--color-card)] outline-none"
      />
      </motion.div>

      <div className="flex flex-wrap gap-3 ml-7 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={` ${cat == `All` ? `bg-accent text-white` : `bg-card`} text-text px-4 py-2 rounded-2xl duration-150 cursor-pointer`}
          onClick={() => dispatch(setCat("All"))}
        >
          All
        </motion.div>

        {loadingCategories ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-[var(--color-card)] animate-pulse rounded-2xl"
            />
          ))
        ) : categories?.length > 0 ? (
          categories.map((i, index) => (
            <motion.div
              key={i._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(setCat(i.name))}
              className={` ${cat == i.name ? `bg-accent text-white` : `bg-card`} text-text px-4 py-2 rounded-2xl duration-150 cursor-pointer`}
            >
              {i.name.charAt(0).toUpperCase() + i.name.slice(1)}
            </motion.div>
          ))
        ) : (
          <p>No categories found</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5 w-full justify-items-center"
      >
        {loadingRecipes &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] w-full max-w-[320px] rounded-2xl bg-[var(--color-card)] animate-pulse"
            />
          ))}

        {!loadingRecipes &&
          filteredRecipes?.map((recipe, index) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              whileHover={{ y: -6 }}
              className="
                flex flex-row lg:flex-col
                w-full
                max-w-[500px] lg:max-w-[320px]
                overflow-hidden
                rounded-2xl
                bg-[var(--color-card)]
                border border-[var(--color-border)]
                shadow-sm
                pl-2
              "
            >
              <div
                className="w-[130px] h-[130px] lg:w-full lg:h-[220px] flex-shrink-0  max-md:translate-y-3.5"
                onClick={() => dispatch(setView(recipe))}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${recipe.image}`}
                  alt={recipe.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">
                      {recipe.name}
                    </h3>

                    <span
                      className="text-2xl cursor-pointer"
                      onClick={() => toggleWishlist(recipe._id)}
                    >
                      <CiHeart
                        className={
                          isInWishlist(recipe._id)
                            ? "text-red-500 duration-200 "
                            : " animate-pulse duration-200"
                        }
                      />
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-muted)]">
                      {recipe.sizes?.[0]?.size}
                    </span>

                    <div className="text-xl font-bold text-accent">
                      {recipe.sizes?.[0]?.price} L.E
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                    className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add To Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
}