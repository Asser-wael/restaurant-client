import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiWifi, FiCalendar, FiClock, FiActivity,
  FiPackage, FiRefreshCw,
} from "react-icons/fi";

import { socket } from "../../services/socket";
import { adminDashboard, setMonth, setday, setyear } from "../../features/dashboardSlice";

const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const fmtMoney = (n) => (n == null ? "—" : "$" + Number(n).toLocaleString("en-US"));

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" },
  }),
};

function Card({ icon: Icon, label, value, color, sub, loading, index, compact }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="show"
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -8px rgba(0,0,0,0.15)" }}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card flex flex-col gap-2 ${
        compact ? "px-4 py-3.5" : "p-5 gap-3"
      }`}
    >
      {!compact && (
        <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: color }} />
      )}

      <div className="flex items-center gap-2">
        {Icon && (
          <span className={compact ? "" : "flex rounded-xl p-2.5"} style={compact ? {} : { background: color + "20" }}>
            <Icon size={compact ? 13 : 17} color={color} />
          </span>
        )}
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>

      {loading ? (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className={`rounded-lg bg-border ${compact ? "h-6 w-20" : "h-8 w-3/5"}`}
        />
      ) : (
        <p className={compact ? "text-xl font-extrabold" : "text-3xl font-extrabold text-text leading-none"} style={compact ? { color } : {}}>
          {value}
        </p>
      )}

      {sub && !compact && <span className="text-xs text-muted">{sub}</span>}
    </motion.div>
  );
}

function PeriodToggle({ type, dispatch }) {
  const opts = [
    { label: "Today", icon: FiClock, action: setday, key: "day" },
    { label: "Month", icon: FiCalendar, action: setMonth, key: "month" },
    { label: "Year", icon: FiActivity, action: setyear, key: "year" },
  ];

  return (
    <div className="flex gap-1.5 rounded-xl border border-border bg-bg p-1">
      {opts.map(({ label, icon: Icon, action, key }) => (
        <button
          key={key}
          onClick={() => dispatch(action())}
          className="relative flex items-center gap-1.5 rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors duration-200 hover:text-text"
        >
          {type === key && (
            <motion.span
              layoutId="periodPill"
              className="absolute inset-0 rounded-lg bg-accent shadow"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-1.5 ${type === key ? "text-white" : ""}`}>
            <Icon size={13} />
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-xl text-sm">
      <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 font-bold" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
          {p.name}:&nbsp;
          {p.name.toLowerCase().includes("revenue") ? "$" : ""}
          {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, icon: Icon, iconColor, loading, empty, legend, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} color={iconColor} />
        <h2 className="text-sm font-bold text-text">{title}</h2>
      </div>

      {legend && (
        <div className="mb-3 flex flex-wrap gap-4">
          {legend.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="h-56 rounded-lg bg-border"
          />
        ) : empty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-56 items-center justify-center text-sm text-muted"
          >
            No data for this period
          </motion.div>
        ) : (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function trimLabels(data, maxVisible = 8) {
  if (!data?.length) return data;
  const step = Math.ceil(data.length / maxVisible);
  return data.map((d, i) => ({ ...d, _label: i % step === 0 ? d.label : "" }));
}

export default function Dashboard() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const dispatch = useDispatch();

  const { todayData, monthData, yearData, type, loading } = useSelector(
    (state) => state.dashboardSlice
  );

  useEffect(() => {
    socket.emit("getOnlineUsers");
    socket.on("onlineUsers", (count) => setOnlineUsers(count));
    return () => socket.off("onlineUsers");
  }, []);

  useEffect(() => {
    dispatch(adminDashboard());
  }, [dispatch]);

  const data = type === "day" ? todayData : type === "month" ? monthData : yearData;
  const chartData = trimLabels(data?.chart ?? [], type === "year" ? 12 : 8);
  const hasChart = chartData.length > 0;

  const cards = [
    { icon: FiWifi, label: "Online Now", color: "#22c55e", value: onlineUsers, sub: "Live visitors" },
    {
      icon: FiDollarSign,
      label: "Revenue",
      color: "#f97316",
      value: fmtMoney(data?.revenue),
      sub: type === "day" ? "Today" : type === "month" ? "This month" : "This year",
    },
    { icon: FiShoppingBag, label: "Orders", color: "#6366f1", value: fmt(data?.orders), sub: "Total orders" },
    { icon: FiUsers, label: "New Users", color: "#0ea5e9", value: fmt(data?.users), sub: "Registered" },
    { icon: FiTrendingUp, label: "Avg Order", color: "#ec4899", value: fmtMoney(data?.avgOrderValue), sub: "Per transaction" },
  ];

  const miniStats = [
    { label: "Avg Order Value", value: fmtMoney(data?.avgOrderValue), color: "#f97316", icon: FiDollarSign },
    { label: "Return Rate", value: data?.returnRate != null ? `${data.returnRate}%` : "—", color: "#ec4899", icon: FiRefreshCw },
    { label: "Total Products", value: fmt(data?.products), color: "#6366f1", icon: FiPackage },
    { label: "Pending Orders", value: fmt(data?.pendingOrders), color: "#eab308", icon: FiShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-bg px-4 py-6 text-text sm:px-6 sm:py-7">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-7 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-extrabold text-text">Dashboard</h1>
          <p className="mt-0.5 text-xs text-muted">Welcome back, Admin 👋</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e44] bg-[#22c55e12] px-3.5 py-1.5">
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#22c55e]"
            />
            <span className="text-xs font-semibold text-[#22c55e]">{onlineUsers} online</span>
          </div>
          <PeriodToggle type={type} dispatch={dispatch} />
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <Card key={c.label} {...c} loading={loading} index={i} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue & Orders"
          icon={FiTrendingUp}
          iconColor="#f97316"
          loading={loading}
          empty={!hasChart}
          className="lg:col-span-2"
          legend={[
            { label: "Revenue ($)", color: "#f97316" },
            { label: "Orders", color: "#6366f1" },
          ]}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="_label" tick={{ fill: "var(--color-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fill: "#f97316", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) => "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v)}
              />
              <YAxis yAxisId="ord" orientation="right" tick={{ fill: "#6366f1", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} fill="url(#gOrd)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="New Users"
          icon={FiUsers}
          iconColor="#0ea5e9"
          loading={loading}
          empty={!hasChart}
          legend={[{ label: "Registrations", color: "#0ea5e9" }]}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="_label" tick={{ fill: "var(--color-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="users" name="Users" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {miniStats.map((s, i) => (
          <Card key={s.label} {...s} loading={loading} index={i} compact />
        ))}
      </div>
    </div>
  );
}