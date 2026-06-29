import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiWifi, FiCalendar, FiClock, FiActivity,
  FiPackage, FiRefreshCw,
} from "react-icons/fi";

import { socket } from "../../services/socket";
import { adminDashboard, setMonth, setday, setyear } from "../../features/dashboardSlice";

// ─── formatters ──────────────────────────────────────────────────────────────
const fmt      = n => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const fmtMoney = n => (n == null ? "—" : "$" + Number(n).toLocaleString("en-US"));

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-border ${className}`} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, sub, loading, index }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card
                 flex flex-col gap-3 p-5
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 70}ms`, animation: "fadeUp .4s ease both" }}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />

      <div className="flex items-center gap-3 mt-1">
        <span className="flex rounded-xl p-2.5" style={{ background: accent + "20" }}>
          <Icon size={17} color={accent} />
        </span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>

      {loading
        ? <Skeleton className="h-8 w-3/5" />
        : <p className="text-3xl font-extrabold text-text leading-none">{value}</p>
      }

      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}

// ─── PeriodToggle ─────────────────────────────────────────────────────────────
function PeriodToggle({ type, dispatch }) {
  const opts = [
    { label: "Today",  icon: FiClock,    action: setday,   key: "day"   },
    { label: "Month",  icon: FiCalendar, action: setMonth, key: "month" },
    { label: "Year",   icon: FiActivity, action: setyear,  key: "year"  },
  ];

  return (
    <div className="flex gap-1.5 rounded-xl border border-border bg-bg p-1">
      {opts.map(({ label, icon: Icon, action, key }) => (
        <button
          key={key}
          onClick={() => dispatch(action())}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold
                      transition-all duration-200
                      ${type === key
                        ? "bg-accent text-white shadow"
                        : "text-muted hover:text-text"}`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-xl text-sm">
      <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-bold flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: p.color }} />
          {p.name}:&nbsp;
          {p.name.toLowerCase().includes("revenue") ? "$" : ""}
          {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ─── ChartCard wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, icon: Icon, iconColor, loading, empty, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5
                  transition-all duration-300 hover:shadow-lg ${className}`}
      style={{ animation: "fadeUp .45s .2s ease both" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} color={iconColor} />
        <h2 className="text-sm font-bold text-text">{title}</h2>
      </div>

      {loading && <Skeleton className="h-56" />}
      {!loading && empty && (
        <div className="flex h-56 items-center justify-center text-sm text-muted">
          No data for this period
        </div>
      )}
      {!loading && !empty && children}
    </div>
  );
}

// ─── MiniStat ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value, color, icon: Icon, loading, index }) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5
                 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animation: `fadeUp .4s ${0.3 + index * 0.06}s ease both` }}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={13} color={color} />}
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span className="text-xl font-extrabold" style={{ color }}>
        {loading ? <Skeleton className="h-6 w-20" /> : value}
      </span>
    </div>
  );
}

// ─── Legend row ───────────────────────────────────────────────────────────────
function LegendRow({ items }) {
  return (
    <div className="flex flex-wrap gap-4 mb-3">
      {items.map(({ label, color }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs text-muted">
          <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── X-axis tick trimmer (show every Nth label to avoid overlap) ──────────────
function trimLabels(data, maxVisible = 8) {
  if (!data?.length) return data;
  const step = Math.ceil(data.length / maxVisible);
  return data.map((d, i) => ({ ...d, _label: i % step === 0 ? d.label : "" }));
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const dispatch = useDispatch();

  const { todayData, monthData, yearData, type, loading } = useSelector(
    state => state.dashboardSlice
  );

  useEffect(() => {
    socket.on("onlineUsers", setOnlineUsers);
    return () => socket.off("onlineUsers");
  }, []);

  useEffect(() => {
    dispatch(adminDashboard());
  }, [dispatch]);

  // Active period data
  const data = type === "day" ? todayData : type === "month" ? monthData : yearData;

  // Trimmed chart data so x-axis labels don't crowd each other
  const chartData = trimLabels(data?.chart ?? [], type === "year" ? 12 : 8);

  const hasChart = chartData.length > 0;

  // ── Stat cards ──
  const cards = [
    {
      icon: FiWifi,       label: "Online Now",  accent: "#22c55e",
      value: onlineUsers, sub: "Live visitors",
    },
    {
      icon: FiDollarSign, label: "Revenue",     accent: "#f97316",
      value: fmtMoney(data?.revenue),
      sub: type === "day" ? "Today" : type === "month" ? "This month" : "This year",
    },
    {
      icon: FiShoppingBag, label: "Orders",     accent: "#6366f1",
      value: fmt(data?.orders),                 sub: "Total orders",
    },
    {
      icon: FiUsers,       label: "New Users",  accent: "#0ea5e9",
      value: fmt(data?.users),                  sub: "Registered",
    },
    {
      icon: FiTrendingUp,  label: "Avg Order",  accent: "#ec4899",
      value: fmtMoney(data?.avgOrderValue),     sub: "Per transaction",
    },
  ];

  // ── Mini stats ──
  const miniStats = [
    { label: "Avg Order Value",  value: fmtMoney(data?.avgOrderValue), color: "#f97316", icon: FiDollarSign  },
    { label: "Return Rate",      value: data?.returnRate != null ? `${data.returnRate}%` : "—", color: "#ec4899", icon: FiRefreshCw },
    { label: "Total Products",   value: fmt(data?.products),           color: "#6366f1", icon: FiPackage     },
    { label: "Pending Orders",   value: fmt(data?.pendingOrders),      color: "#eab308", icon: FiShoppingBag },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:1 } 50% { opacity:.4 }
        }
      `}</style>

      <div className="min-h-screen bg-bg px-6 py-7 text-text">

        {/* ── Header ── */}
        <div
          className="mb-7 flex flex-wrap items-center justify-between gap-3"
          style={{ animation: "fadeUp .35s ease both" }}
        >
          <div>
            <h1 className="text-xl font-extrabold text-text">Dashboard</h1>
            <p className="mt-0.5 text-xs text-muted">Welcome back, Admin 👋</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Online badge */}
            <div className="inline-flex items-center gap-2 rounded-full border
                            border-[#22c55e44] bg-[#22c55e12] px-3.5 py-1.5">
              <span
                className="h-2 w-2 rounded-full bg-[#22c55e]"
                style={{ boxShadow: "0 0 0 3px #22c55e33", animation: "pulse 1.5s infinite" }}
              />
              <span className="text-xs font-semibold text-[#22c55e]">
                {onlineUsers} online
              </span>
            </div>
            <PeriodToggle type={type} dispatch={dispatch} />
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c, i) => (
            <StatCard key={c.label} {...c} loading={loading} index={i} />
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="mb-6 grid gap-4 grid-cols-1 lg:grid-cols-3">

          {/* Revenue & Orders — spans 2 cols */}
          <ChartCard
            title="Revenue & Orders"
            icon={FiTrendingUp}
            iconColor="#f97316"
            loading={loading}
            empty={!hasChart}
            className="lg:col-span-2"
          >
            <LegendRow items={[
              { label: "Revenue ($)", color: "#f97316" },
              { label: "Orders",      color: "#6366f1" },
            ]} />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="_label"
                  tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  orientation="left"
                  tick={{ fill: "#f97316", fontSize: 10 }}
                  axisLine={false} tickLine={false} width={52}
                  tickFormatter={v => "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v)}
                />
                <YAxis
                  yAxisId="ord"
                  orientation="right"
                  tick={{ fill: "#6366f1", fontSize: 10 }}
                  axisLine={false} tickLine={false} width={36}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#f97316" strokeWidth={2} fill="url(#gRev)"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  yAxisId="ord" type="monotone" dataKey="orders" name="Orders"
                  stroke="#6366f1" strokeWidth={2} fill="url(#gOrd)"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* New Users bar chart */}
          <ChartCard
            title="New Users"
            icon={FiUsers}
            iconColor="#0ea5e9"
            loading={loading}
            empty={!hasChart}
          >
            <LegendRow items={[{ label: "Registrations", color: "#0ea5e9" }]} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="_label"
                  tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                  axisLine={false} tickLine={false} width={30}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="users" name="Users"
                  fill="#0ea5e9" radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Mini stats row ── */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {miniStats.map((s, i) => (
            <MiniStat key={s.label} {...s} loading={loading} index={i} />
          ))}
        </div>

      </div>
    </>
  );
}