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
      icon: <FaTruckFast size={24} />,
      title: "Fast Delivery",
      desc: "On time, every time",
    },
    {
      id: 2,
      icon: <FaBowlFood size={24} />,
      title: "Fresh Food",
      desc: "Cooked fresh daily",
    },
    {
      id: 3,
      icon: <FaRegCreditCard size={24} />,
      title: "Secure Payment",
      desc: "100% secure payments",
    },
    {
      id: 4,
      icon: <FaTrophy size={24} />,
      title: "Best Quality",
      desc: "Top quality ingredients",
    },
  ];
  if (view) {
    return <UserView />
  }
  return (
    <section className="min-h-screen px-20 py-10 -translate-y-10 w-full flex flex-col ">
      <div className="flex items-center justify-between max-md:scale-90 max-md:-translate-9 w-full flex-wrap">
        <motion.div
          initial={{ opacity: 0, }}
          animate={{ opacity: 1, }}
          transition={{ duration: 0.5 }}
          className="w-[600px] translate-y-14"
        >
          <h1 className="text-7xl font-bold leading-tight">
            Delicious food,
            <span className="text-orange-500"> Delivered</span> To You
          </h1>

          <p className="text-gray-500 mt-6 text-xl">
            Order your favorite food and enjoy fresh premium meals delivered to
            you.
          </p>

          <button onClick={() => navigate("/menu")} className="mt-8 bg-orange-500 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 block transition">
            Order Now
          </button>
        </motion.div>

        <div className="w-full max-w-[450px] flex flex-col gap-4 max-xl:translate-y-20 my-10">
          {offers?.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-[var(--color-card)] animate-pulse rounded-xl"
              />
            ))
          ) : (
            offers?.map((offer, index) => (
              <motion.div
                key={offer._id || index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-md p-5 flex items-center gap-4"
                onClick={() => dispatch(setView(offer))}
              >
                {/* Glow effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />

                {/* ICON / IMAGE */}
                <div className="w-14 aspect-[1/4] h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-lg shrink-0">
                  <img src={`${import.meta.env.VITE_API_URL}/uploads/${offer?.image}`} alt=""
                    className="w-full rounded-t-2xl h-full object-cover object-center scale-95 transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-orange-500">
                    {offer.name || "Special Offer"}
                  </h3>

                  <p className="text-sm text-[var(--color-muted)]">
                    {offer.description || "Get amazing discount on selected meals"}
                  </p>

                  {/* optional badge */}
                  {offer.discount && (
                    <span className="mt-2 text-xs font-bold text-green-600">
                      Save {offer.discount}%
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, }}
        whileInView={{ opacity: 1, }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mt-20 bg-[var(--color-card)] border border-[var(--color-border)] w-full rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-6 rounded-br-none max-md:-translate-y-15"
      >

        {features.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={item.id}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
            }}
            whileHover={{
              scale: 1.03,
            }}
            className="flex items-center gap-4 flex-1 min-w-[200px]"
          >
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[var(--color-accent)] shrink-0">
              {item.icon}
            </div>

            <div>
              <h4 className="font-bold text-lg">{item.title}</h4>
              <p className="text-sm text-[var(--color-muted)]">
                {item.desc}
              </p>
            </div>
          </motion.div>

        ))}
      </motion.div>
      <div>
        <div className="w-full flex justify-between items-center my-4">
          <h2 className="text-2xl font-bold ">Categories</h2>
          {categories.length > 8 && (
            <button
              className="font-bold cursor-pointer text-accent"
              onClick={() => setViewAll((prev) => !prev)}
            >
              {viewAll ? "Show Less" : "View All"}
            </button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          {loadingCategories ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[320px] w-100 mx-6 bg-[var(--color-card)] animate-pulse rounded-xl"
              />
            ))
          ) : (
            (viewAll ? categories : categories.slice(0, 8)).map((cat, index) => (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                key={cat._id}
                onClick={() => {
                  dispatch(setCat(cat.name))
                  navigate("menu")
                }
                }
                className="bg-card border cursor-pointer border-[var(--color-border)] w-32 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col items-center"
              >
                {cat.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${cat.image}`}
                    alt={cat.name}
                    className="w-20 h-20 object-cover rounded-full mb-3"
                  />
                )}

                <h3 className="font-semibold text-lg text-center">
                  {cat.name}
                </h3>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <div className="my-6 w-full">
        <h2 className="text-2xl font-bold mb-5">Popular Dishes</h2>

        {loadingPopular ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[320px] w-100 mx-6 bg-[var(--color-card)] animate-pulse rounded-xl"
            />
          ))

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5 w-full justify-items-center">
            {PopularDishes?.map((item, index) => {
              const meal = item.id;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="h-full flex flex-col bg-[var(--color-card)] rounded-2xl shadow-md overflow-hidden border border-[var(--color-border)] "
                >
                  {/* IMAGE */}

                  <div className="aspect-[4/4] w-full overflow-hidden relative " onClick={() => dispatch(setView(item.id))} >
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${meal?.image}`}
                      alt={meal?.name}
                      className="w-full rounded-t-2xl h-full object-cover object-center scale-95 transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg">{meal?.name}</h3>

                    <p className="text-sm text-[var(--color-muted)] line-clamp-2 mt-1">
                      {meal?.description}
                    </p>

                    {/* SIZES */}
                    <div className="mt-3 space-y-2 flex-1">
                      {meal.sizes?.map((size, idx) => {
                        if (!size.price) return null;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-green-500 transition"
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

                    {/* BUTTON */}
                    <button
                      onClick={() => dispatch(setView(item.id))}
                      className="mt-4 w-full bg-orange-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-orange-600 active:scale-95 transition"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section >
  );
}