import { FaTruckFast, FaBowlFood, FaRegCreditCard, FaTrophy } from "react-icons/fa6";
import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories, getOffers, getPopularDishes, } from "../../features/customuseSlice";
import { setView } from "../../features/usersSlice";
import Loading from "../../components/loading";
import UserView from "../../components/UserView";
import { setCat } from "../../features/menuSlice";

import { useNavigate } from "react-router-dom";

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [viewAll, setViewAll] = useState(false);

  const {
    categories = [],
    offers,
    PopularDishes,
    loadingCategories,
    loadingoffer,
    loadingPopular,
  } = useSelector((state) => state.customuseSlice);
  const {
    view
  } = useSelector((state) => state.usersSlice);



  useEffect(() => {

    dispatch(getOffers());
    dispatch(getAllCategories());
    dispatch(getPopularDishes());

  }, [dispatch]);
  const features = [
    {
      id: 1,
      icon: <FaTruckFast size={22} />,
      title: "Fast Delivery",
      desc: "On time, every time",
    },
    {
      id: 2,
      icon: <FaBowlFood size={22} />,
      title: "Fresh Food",
      desc: "Cooked fresh daily",
    },
    {
      id: 3,
      icon: <FaRegCreditCard size={22} />,
      title: "Secure Payment",
      desc: "100% secure payments",
    },
    {
      id: 4,
      icon: <FaTrophy size={22} />,
      title: "Best Quality",
      desc: "Top quality ingredients",
    },
  ];
  if (view) {
    return <UserView />
  }
  return (
    <section className="min-h-screen w-full px-4 sm:px-8 lg:px-14 xl:px-20 py-10 flex flex-col gap-16 overflow-x-hidden">

      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full lg:max-w-[560px] text-center lg:text-left"
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-sm font-semibold tracking-wide">
            Fresh. Fast. Delivered.
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
            Delicious food,
            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent"> Delivered</span> To You
          </h1>

          <p className="text-[var(--color-muted)] mt-5 text-base sm:text-lg lg:text-xl max-w-md mx-auto lg:mx-0">
            Order your favorite food and enjoy fresh premium meals delivered to you.
          </p>

          <button
            onClick={() => navigate("/menu")}
            className="mt-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/30 font-semibold tracking-wide hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Order Now
          </button>
        </motion.div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="w-full lg:max-w-[440px] flex flex-col gap-4"
        >
          {offers?.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-[var(--color-card)] animate-pulse rounded-2xl"
              />
            ))
          ) : (
            offers?.map((offer, index) => (
              <motion.div
                key={offer._id || index}
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-md hover:shadow-xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer transition-shadow duration-300"
                onClick={() => dispatch(setView(offer))}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-lg shrink-0 overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${offer?.image}`}
                    alt=""
                    className="w-full h-full object-cover object-center scale-95 transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-orange-500 truncate">
                    {offer.name || "Special Offer"}
                  </h3>

                  <p className="text-sm text-[var(--color-muted)] line-clamp-2">
                    {offer.description || "Get amazing discount on selected meals"}
                  </p>

                  {offer.discount && (
                    <span className="mt-2 w-fit text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                      Save {offer.discount}%
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <motion.div
        variants={containerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-[var(--color-card)] border border-[var(--color-border)] w-full rounded-3xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6"
      >

        {features.map((item) => (
          <motion.div
            variants={fadeUp}
            key={item.id}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-4 flex-1 min-w-[220px]"
          >
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[var(--color-accent)] shrink-0">
              {item.icon}
            </div>

            <div>
              <h4 className="font-bold text-base sm:text-lg">{item.title}</h4>
              <p className="text-sm text-[var(--color-muted)]">
                {item.desc}
              </p>
            </div>
          </motion.div>

        ))}
      </motion.div>

      <div className="w-full">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Categories</h2>
          {categories.length > 8 && (
            <button
              className="font-semibold cursor-pointer text-orange-500 hover:text-orange-600 transition-colors"
              onClick={() => setViewAll((prev) => !prev)}
            >
              {viewAll ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
          {loadingCategories ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-40 w-32 bg-[var(--color-card)] animate-pulse rounded-2xl"
              />
            ))
          ) : (
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="flex gap-4 flex-wrap justify-center sm:justify-start w-full"
            >
              {(viewAll ? categories : categories.slice(0, 8)).map((cat) => (
                <motion.div
                  variants={fadeUp}
                  key={cat._id}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    dispatch(setCat(cat.name))
                    navigate("menu")
                  }
                  }
                  className="bg-[var(--color-card)] border cursor-pointer border-[var(--color-border)] w-28 sm:w-32 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center"
                >
                  {cat.image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${cat.image}`}
                      alt={cat.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full mb-3 ring-2 ring-transparent hover:ring-orange-400 transition-all duration-300"
                    />
                  )}

                  <h3 className="font-semibold text-sm sm:text-lg text-center truncate w-full">
                    {cat.name}
                  </h3>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Popular Dishes</h2>

        {loadingPopular ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[320px] w-full bg-[var(--color-card)] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 w-full"
          >
            {PopularDishes?.map((item) => {
              const meal = item.id;

              return (
                <motion.div
                  key={item._id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="h-full flex flex-col bg-[var(--color-card)] rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-[var(--color-border)] transition-shadow duration-300"
                >
                  <div
                    className="aspect-square w-full overflow-hidden relative cursor-pointer group"
                    onClick={() => dispatch(setView(item.id))}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${meal?.image}`}
                      alt={meal?.name}
                      className="w-full h-full object-cover object-center scale-100 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg truncate">{meal?.name}</h3>

                    <p className="text-sm text-[var(--color-muted)] line-clamp-2 mt-1">
                      {meal?.description}
                    </p>

                    <div className="mt-3 space-y-2 flex-1">
                      {meal.sizes?.map((size, idx) => {
                        if (!size.price) return null;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-green-500 transition-colors duration-300"
                          >
                            <span className="font-medium text-sm">
                              {size.size}
                            </span>

                            <span className="text-green-600 font-bold text-sm">
                              {size.price} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => dispatch(setView(item.id))}
                      className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all duration-300"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}