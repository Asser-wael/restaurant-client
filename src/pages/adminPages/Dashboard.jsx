import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiWifi, FiCalendar, FiClock, FiActivity,
} from "react-icons/fi";
import { socket } from "../../services/socket";
import { adminDashboard, setMonth, setday, setyear } from "../../features/dashboardSlice";


const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const fmtMoney = (n) => (n == null ? "—" : "$" + Number(n).toLocaleString("en-US"));


const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-border ${className}`} />
);


function StatCard({ icon: Icon, label, value, accent, sub, loading, index }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card
                 flex flex-col gap-3 p-5
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: "fadeUp .45s ease both",
        "--tw-shadow-color": accent + "33",
      }}
    >
      {/* top accent bar */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        style={{ background: accent }}
      />

      {/* icon + label */}
      <div className="flex items-center gap-3 mt-1">
        <span className="flex rounded-xl p-2.5" style={{ background: accent + "22" }}>
          <Icon size={18} color={accent} />
        </span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>

      {/* value */}
      {loading
        ? <Skeleton className="h-8 w-3/5" />
        : <p className="text-3xl font-extrabold text-text leading-none">{value}</p>
      }

      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
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


function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-xl text-sm">
      <p className="mb-1.5 text-xs text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.name.toLowerCase().includes("revenue") ? "$" : ""}
          {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}


function ChartCard({ title, icon: Icon, iconColor, loading, empty, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5
                    transition-all duration-300 hover:shadow-lg"
      style={{ animation: "fadeUp .5s .25s ease both" }}>

      <div className="flex items-center gap-2 mb-5">
        <Icon size={17} color={iconColor} />
        <h2 className="text-sm font-bold text-text">{title}</h2>
      </div>

      {loading && <Skeleton className="h-60" />}
      {!loading && empty && (
        <div className="flex h-60 items-center justify-center text-sm text-muted">
          No data yet
        </div>
      )}
      {!loading && !empty && children}
    </div>
  );
}

function MiniStat({ label, value, color, loading, index }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3.5
                 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animation: `fadeUp .45s ${0.35 + index * 0.06}s ease both` }}
    >
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xl font-extrabold" style={{ color }}>
        {loading ? "…" : value}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const dispatch = useDispatch();

  const { todayData, monthData, yearData, type, loading } = useSelector(
    (state) => state.dashboardSlice
  );

  useEffect(() => {
    socket.on("onlineUsers", setOnlineUsers);
    return () => socket.off("onlineUsers");
  }, []);

  useEffect(() => {
    dispatch(adminDashboard());
  }, [dispatch]);

  const data = type === "day" ? todayData : type === "month" ? monthData : yearData;
  const chartData = data

  const cards = [
    { icon: FiWifi, label: "Online Now", value: onlineUsers, accent: "#22c55e", sub: "Live users" },
    { icon: FiDollarSign, label: "Revenue", value: fmtMoney(data?.revenue ?? data?.totalRevenue), accent: "#f97316", sub: type === "day" ? "Today" : type === "month" ? "This month" : "This year" },
    { icon: FiShoppingBag, label: "Orders", value: fmt(data?.orders ?? data?.totalOrders), accent: "#6366f1", sub: "Total orders" },
    { icon: FiUsers, label: "New Users", value: fmt(data?.users ?? data?.newUsers), accent: "#0ea5e9", sub: "Registered" },
    { icon: FiTrendingUp, label: "Conversion", value: data?.conversion != null ? `${data.conversion}%` : "—", accent: "#ec4899", sub: "Visits → Orders" },
  ];

  const miniStats = [
    { label: "Avg Order Value", value: fmtMoney(data?.avgOrderValue), color: "#f97316" },
    { label: "Return Rate", value: data?.returnRate != null ? `${data.returnRate}%` : "—", color: "#ec4899" },
    { label: "Total Products", value: fmt(data?.products ?? data?.totalProducts), color: "#6366f1" },
    { label: "Pending Orders", value: fmt(data?.pendingOrders), color: "#eab308" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%,100% { opacity:1 } 50% { opacity:.4 }
        }
      `}</style>

      <div className="min-h-screen bg-bg px-6 py-7 text-text">

        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"
          style={{ animation: "fadeUp .4s ease both" }}>
          <div>
            <h1 className="text-xl font-extrabold text-text">Dashboard</h1>
            <p className="mt-0.5 text-xs text-muted">Welcome back, Admin 👋</p>
          </div>
          <PeriodToggle type={type} dispatch={dispatch} />
        </div>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border
                        border-[#22c55e44] bg-[#22c55e18] px-3.5 py-1.5"
          style={{ animation: "fadeUp .4s .1s ease both" }}>
          <span className="h-2 w-2 rounded-full bg-[#22c55e]"
            style={{ boxShadow: "0 0 0 3px #22c55e44", animation: "pulse 1.4s infinite" }} />
          <span className="text-xs font-semibold text-[#22c55e]">
            {onlineUsers} users online
          </span>
        </div>

        <div className="mb-7 grid gap-4
                        grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c, i) => (
            <StatCard key={c.label} {...c} loading={loading} index={i} />
          ))}
        </div>

        <div className="mb-7 grid gap-4 grid-cols-1 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <ChartCard
              title="Revenue & Orders"
              icon={FiTrendingUp}
              iconColor="var(--color-accent)"
              loading={loading}
              empty={chartData.length === 0}
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2.5} fill="url(#gOrd)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard
            title="New Users"
            icon={FiUsers}
            iconColor="#0ea5e9"
            loading={loading}
            empty={chartData.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="users" name="Users" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {miniStats.map((s, i) => (
            <MiniStat key={s.label} {...s} loading={loading} index={i} />
          ))}
        </div>

      </div>
    </>
  );
}