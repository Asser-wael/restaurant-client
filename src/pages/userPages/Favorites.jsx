import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CiHeart } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { getAllRecipes } from "../../features/menuSlice";
import { setView } from "../../features/usersSlice";
import UserView from "../../components/UserView";

export default function Favorites() {
  const [wishlist, setWishlist] = useState([]);

  const { recipes } = useSelector((state) => state.menuSlice);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllRecipes());
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      let updated;

      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      }

      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };
  const wishlistRecipes = recipes.filter((recipe) =>
    wishlist.includes(recipe._id)
  );
  const { view } = useSelector((state) => state.usersSlice);


  if (view) {
    return <UserView />;
  }
  return (
    <div className="p-4">


      {wishlistRecipes.length === 0 ? (
        <div className="text-center mt-20 text-[var(--color-muted)]">
          <CiHeart className="text-6xl mx-auto mb-4" />
          <p>No favorite meals yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5 w-full justify-items-center">
          {wishlistRecipes.map((recipe, index) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              className="
                flex flex-row lg:flex-col
                w-full
                max-w-[500px] lg:max-w-[320px]
                overflow-hidden
                rounded-2xl
                bg-[var(--color-card)]
                border border-[var(--color-border)]
                shadow-sm
              "
            >
              <div className="w-[130px] h-[130px] lg:w-full lg:h-[220px] flex-shrink-0 max-md:pl-3">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${recipe.image}`}
                  alt={recipe.name}
                  className="w-full h-full object-cover rounded-2xl max-lg:translate-y-3 "
                />
              </div>

              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">
                      {recipe.name}
                    </h3>

                    <span className="text-red-500 text-2xl cursor-pointer" onClick={()=> toggleWishlist(recipe._id)}>
                      <CiHeart />
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

                  <button onClick={() => dispatch(setView(recipe))} className="bg-accent text-white px-4 py-2 rounded-lg text-sm">
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}