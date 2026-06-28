
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ToggleButton from "../../components/ToggleButton";
import { LuSearch } from "react-icons/lu";
import { MdMenu, MdClose } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { GiChefToque } from "react-icons/gi";
import { RiAdminFill } from "react-icons/ri";
import { clearView } from "../../features/usersSlice";
import { useDispatch, useSelector } from "react-redux";
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const menuItems = [
    { id: 1, title: "Home", to: "/" },
    { id: 2, title: "Menu", to: "/menu" },
    { id: 3, title: "Favorites", to: "/favorites" },
    { id: 4, title: "Cart", to: "/cart" },
    { id: 5, title: "Orders", to: "/orders" },
    // { id: 6, title: "Track Order", to: "/order-tracking" },
  ];
  const token = localStorage.getItem("accessToken")
  const { cart } = useSelector(
    (state) => state.cartSlice
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="sticky top-0 z-30 bg-[var(--color-card)] border-b border-[var(--color-border)] ">
        <div className="mx-auto px-6 py-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(true)}
              className="text-3xl lg:hidden"
            >
              <MdMenu />
            </motion.button>

            <h1
              className="cursor-pointer text-4xl font-bold -translate-y-3  text-orange-500 logo"
              onClick={() => {
                dispatch(clearView())
                navigate("/")
              }}
            >
              <GiChefToque size={40} className="text-orange-500 translate-x-13 translate-y-4" />
              Restaurant
            </h1>

          </div>

   {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.to)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                location.pathname === item.to
                  ? "text-accent"
                  : "hover:bg-[var(--color-bg)]"
              }`}
            >
              {item.title}
            </motion.button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 md:gap-5">

          {token && (
            <RiAdminFill
              onClick={() => navigate("/admin")}
              className="text-accent text-xl md:text-2xl cursor-pointer"
            />
          )}

          <LuSearch
            onClick={() => navigate("/search")}
            className="text-xl cursor-pointer hover:text-orange-500 transition"
          />

          <div className="relative">

            <FiShoppingCart
              onClick={() => navigate("/cart")}
              className={`text-xl md:text-2xl cursor-pointer hover:text-orange-500 transition ${
                location.pathname === "/cart"
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text)]"
              }`}
            />

            {cart.length > 0 && (
              <span
                className="
                  absolute
                  -top-2
                  max-sm:-top-3
                  -right-2
                  min-w-5
                  h-5
                  rounded-full
                  bg-orange-500
                  text-white
                  text-[10px]
                  flex
                  items-center
                  justify-center
                  px-1
                  max-sm:scale-50
                "
              >
                {cart.length}
              </span>
            )}

          </div>

          <ToggleButton />

        </div>

      </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-screen w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-2xl z-50 lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2
                    className="cursor-pointer text-4xl font-bold text-orange-500 logo"
                    onClick={() => navigate("/")}
                  >
                    Restaurant
                  </h2>

                  <button
                    onClick={() => setOpen(false)}
                    className="text-3xl"
                  >
                    <MdClose />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.to == "/") {
                          dispatch(clearView())
                        }
                        navigate(item.to);
                        setOpen(false)
                      }}
                      className={`text-left px-4 py-3 rounded-lg transition-all ${location.pathname === item.to
                        ? "bg-orange-500 text-white"
                        : "hover:bg-[var(--color-bg)]"
                        }`}
                    >
                      {item.title}
                    </button>
                  ))}

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        <Outlet />
      </main>
    </motion.div>
  );
}