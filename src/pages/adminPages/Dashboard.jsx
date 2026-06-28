import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiWifi,
  FiCalendar,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import { socket } from "../../services/socket";
import { adminDashboard } from "../../features/dashboardSlice";
import { setMonth, setday, setyear } from "../../features/dashboardSlice";

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt = (n) =>
  n === undefined || n === null
    ? "—"
    : Number(n).toLocaleString("en-US");

const fmtMoney = (n) =>
  n === undefined || n === null
    ? "—"
    : "$" + Number(n).toLocaleString("en-US");

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent, sub, loading }) {
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow .2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = `0 8px 32px ${accent}22`)
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* accent bar */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background: accent,
          borderRadius: "16px 16px 0 0",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            background: accent + "22",
            borderRadius: 10,
            padding: 10,
            display: "flex",
          }}
        >
          <Icon size={20} color={accent} />
        </span>
        <span
          style={{
            color: "var(--color-muted)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            height: 36,
            width: "60%",
            borderRadius: 8,
            background: "var(--color-border)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
      ) : (
        <p
          style={{
            color: "var(--color-text)",
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      )}

      {sub && (
        <span style={{ color: "var(--color-muted)", fontSize: 12 }}>{sub}</span>
      )}
    </div>
  );
}

/* ─── Period Toggle ─────────────────────────────────────────── */
function PeriodToggle({ type, dispatch }) {
  const opts = [
    { label: "Today", icon: FiClock, action: setday, key: "day" },
    { label: "Month", icon: FiCalendar, action: setMonth, key: "month" },
    { label: "Year", icon: FiActivity, action: setyear, key: "year" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 4,
      }}
    >
      {opts.map(({ label, icon: Icon, action, key }) => {
        const active = type === key;
        return (
          <button
            key={key}
            onClick={() => dispatch(action())}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              transition: "all .18s",
              background: active ? "var(--color-accent)" : "transparent",
              color: active ? "#fff" : "var(--color-muted)",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Custom Tooltip ────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "10px 16px",
        boxShadow: "0 4px 20px #0002",
      }}
    >
      <p
        style={{
          color: "var(--color-muted)",
          fontSize: 12,
          margin: "0 0 6px",
        }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.color, fontSize: 14, fontWeight: 700, margin: 0 }}
        >
          {p.name}: {p.name.toLowerCase().includes("revenue") ? "$" : ""}
          {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

/* ─── Main Dashboard ────────────────────────────────────────── */
export default function Dashboard() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const dispatch = useDispatch();
  const { todayData, monthData, yearData, type, loading } = useSelector(
    (state) => state.dashboardSlice
  );

  useEffect(() => {
    socket.on("onlineUsers", (count) => setOnlineUsers(count));
    return () => socket.off("onlineUsers");
  }, []);

  useEffect(() => {
    dispatch(adminDashboard());
  }, [dispatch]);

  const data =
    type === "day" ? todayData : type === "month" ? monthData : yearData;

  /* build chart series from whatever the API returns */
  const chartData = data?.chart || data?.sales || data?.orders || [];

  const cards = [
    {
      icon: FiWifi,
      label: "Online Now",
      value: onlineUsers,
      accent: "#22c55e",
      sub: "Live users on site",
    },
    {
      icon: FiDollarSign,
      label: "Revenue",
      value: fmtMoney(data?.revenue ?? data?.totalRevenue),
      accent: "#f97316",
      sub: type === "day" ? "Today" : type === "month" ? "This month" : "This year",
    },
    {
      icon: FiShoppingBag,
      label: "Orders",
      value: fmt(data?.orders ?? data?.totalOrders),
      accent: "#6366f1",
      sub: "Total orders",
    },
    {
      icon: FiUsers,
      label: "New Users",
      value: fmt(data?.users ?? data?.newUsers),
      accent: "#0ea5e9",
      sub: "Registered accounts",
    },
    {
      icon: FiTrendingUp,
      label: "Conversion",
      value:
        data?.conversion != null ? `${data.conversion}%` : "—",
      accent: "#ec4899",
      sub: "Visits → Orders",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: .45; }
        }
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .dash-grid { grid-template-columns: 1fr 1fr; }
          .chart-row { flex-direction: column !important; }
        }
        @media (max-width: 400px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        style={{
          padding: "28px 24px",
          minHeight: "100vh",
          background: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
              }}
            >
              Dashboard
            </h1>
            <p style={{ margin: "4px 0 0", color: "var(--color-muted)", fontSize: 13 }}>
              Welcome back, Admin 👋
            </p>
          </div>

          <PeriodToggle type={type} dispatch={dispatch} />
        </div>

        {/* ── Online badge ── */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#22c55e18",
            border: "1px solid #22c55e44",
            borderRadius: 100,
            padding: "6px 14px",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 3px #22c55e44",
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
            {onlineUsers} users online
          </span>
        </div>

        {/* ── Stat Cards ── */}
        <div className="dash-grid" style={{ marginBottom: 28 }}>
          {cards.map((c) => (
            <StatCard key={c.label} {...c} loading={loading} />
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div
          className="chart-row"
          style={{ display: "flex", gap: 16, marginBottom: 28 }}
        >
          {/* Area Chart */}
          <div
            style={{
              flex: 2,
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "20px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <FiTrendingUp color="var(--color-accent)" size={18} />
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                Revenue & Orders
              </h2>
            </div>

            {loading ? (
              <div
                style={{
                  height: 240,
                  borderRadius: 10,
                  background: "var(--color-border)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            ) : chartData.length === 0 ? (
              <div
                style={{
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-muted)",
                  fontSize: 14,
                }}
              >
                No chart data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#gradRev)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#f97316" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#gradOrd)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart */}
          <div
            style={{
              flex: 1,
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "20px 16px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <FiUsers color="#0ea5e9" size={18} />
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                New Users
              </h2>
            </div>

            {loading ? (
              <div
                style={{
                  height: 240,
                  borderRadius: 10,
                  background: "var(--color-border)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            ) : chartData.length === 0 ? (
              <div
                style={{
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-muted)",
                  fontSize: 14,
                }}
              >
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="users"
                    name="Users"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Quick Stats Footer Row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Avg Order Value",
              value: fmtMoney(data?.avgOrderValue),
              color: "#f97316",
            },
            {
              label: "Return Rate",
              value: data?.returnRate != null ? `${data.returnRate}%` : "—",
              color: "#ec4899",
            },
            {
              label: "Total Products",
              value: fmt(data?.products ?? data?.totalProducts),
              color: "#6366f1",
            },
            {
              label: "Pending Orders",
              value: fmt(data?.pendingOrders),
              color: "#eab308",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
                {item.label}
              </span>
              <span
                style={{
                  color: item.color,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {loading ? "…" : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}