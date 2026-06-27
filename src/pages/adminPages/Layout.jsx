import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdMenu,
  MdDashboardCustomize,
  MdLogout,
} from "react-icons/md";
import { IoFastFood } from "react-icons/io5";
import { FaPager } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/authSlice";
import ThemeToggle from "../../components/ToggleButton";

export default function Layout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    { id: 1, title: "Dashboard", icon: <MdDashboard />, to: "/admin" },
    { id: 2, title: "Kitchen", icon: <IoFastFood />, to: "/admin/kitchen" },
    { id: 3, title: "Orders", icon: <MdShoppingCart />, to: "/admin/orders" },
    { id: 4, title: "Users", icon: <MdPeople />, to: "/admin/users" },
    { id: 5, title: "Customuse", icon: <MdDashboardCustomize />, to: "/admin/customuse" },
    { id: 6, title: "Home", icon: <FaPager />, to: "/" },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* SIDEBAR */}
      <div
        className={`flex flex-col border-r border-border p-3 transition-all duration-300
        ${open ? "w-64 max-sm:w-50" : "w-20"}`}
      >

        {/* TOP */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => setOpen(!open)}
            className="text-2xl p-2 rounded-lg hover:bg-[var(--color-card)]"
          >
            <MdMenu />
          </motion.button>

          {open && <ThemeToggle />}
        </motion.div>

        {/* MENU */}
        <div className="flex flex-col gap-2 flex-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              onClick={() => navigate(item.to)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition 
                ${location.pathname === item.to
                  ? "bg-[var(--color-card)] text-[var(--color-accent)] border-l-2"
                  : "hover:bg-[var(--color-card)] text-[var(--color-muted)]"
                }`}
            >
              <span className="text-xl">{item.icon}</span>

              {open && <span className="font-medium">{item.title}</span>}
            </motion.div>
          ))}
        </div>

        {/* LOGOUT */}
        <motion.button
          onClick={async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              window.location.reload();
              navigate("/");
            } catch (error) {
              console.log(error);
            }
          }}
          className="flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition"
        >
          <MdLogout className="text-xl" />
          {open && <span>Logout</span>}
        </motion.button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 overflow-auto bg-[var(--color-bg)]">
        <Outlet />
      </div>
    </div>
  );
}