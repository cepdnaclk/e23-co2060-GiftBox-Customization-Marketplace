import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FaShoppingCart, FaDollarSign, FaBoxOpen, FaStar,
  FaArrowUp, FaArrowDown, FaStore, FaClock
} from 'react-icons/fa';
import './VendorDashboard.css';

// ── Config ────────────────────────────────────────────────────
const API_BASE  = `${process.env.REACT_APP_API_URL}/api`;
const getSellerId = () => {
  const localId = localStorage.getItem('userId');
  return localId ? parseInt(localId, 10) : 2; // fallback to 2 for development or preview
};

const STATUS_COLOR_MAP = {
  DELIVERED:  { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
  PENDING:    { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
  CONFIRMED:  { bg: '#FEF9ED', color: '#854F0B', border: '#FAC775' },
  ASSEMBLING: { bg: '#F0E6FB', color: '#6A1FAB', border: '#C49AEB' },
  SHIPPED:    { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
  CANCELLED:  { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
  READY:      { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
};

const PIE_COLORS = {
  DELIVERED:  '#2E7D52',
  PENDING:    '#C9A84C',
  CONFIRMED:  '#E8C96A',
  CANCELLED:  '#C0392B',
  ASSEMBLING: '#9B7EE0',
  SHIPPED:    '#4A90D9',
  READY:      '#5AB88A',
};

// ── Helpers ───────────────────────────────────────────────────
const fmtLKR = (n) => Number(n || 0).toLocaleString('en-LK');

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ── Sub-components ────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sd-tooltip">
      <p className="sd-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="sd-tooltip-row">
          {p.name}: <span className="sd-tooltip-val">{prefix}{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon, title, value, sub }) => (
  <div className="sd-stat-card">
    <div className="sd-stat-icon">{icon}</div>
    <div className="sd-stat-body">
      <p className="sd-stat-title">{title}</p>
      <h3 className="sd-stat-value">{value}</h3>
      {sub && <span className="sd-stat-sub" style={{ fontSize: '12px', color: '#7A869A', marginTop: '4px', display: 'block' }}>{sub}</span>}
    </div>
  </div>
);

const SectionTitle = ({ title, action, onAction }) => (
  <div className="sd-section-title">
    <h2>{title}</h2>
    {action && <button className="sd-section-btn" onClick={onAction}>{action}</button>}
  </div>
);

const ChartCard = ({ children, style }) => (
  <div className="sd-chart-card" style={style}>{children}</div>
);

const StatusPill = ({ status }) => {
  const s = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.PENDING;
  return (
    <span className="sd-status-pill" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────
const VendorDashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [weekly,   setWeekly]   = useState([]);
  const [monthly,  setMonthly]  = useState([]);
  const [pieData,  setPieData]  = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  const SELLER_ID = useMemo(() => getSellerId(), []);

  // ── Fetch dashboard data ──
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Dashboard stats
        const dashRes = await fetch(`${API_BASE}/vendor/${SELLER_ID}/dashboard`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (dashRes.ok) {
          const dash = await dashRes.json();
          setStats(dash);

          // Weekly chart data
          if (dash.weeklyData?.length) {
            setWeekly(dash.weeklyData.map(d => ({
              day: d.day, orders: Number(d.orders), revenue: Number(d.revenue),
            })));
          } else {
            setWeekly([]);
          }

          // Monthly chart data
          if (dash.monthlyRevenue?.length) {
            setMonthly(dash.monthlyRevenue.map(d => ({
              month: d.month, revenue: Number(d.revenue),
            })));
          } else {
            setMonthly([]);
          }

          // Pie chart data
          if (dash.statusDistribution) {
            const total = Object.values(dash.statusDistribution).reduce((a, b) => a + Number(b), 0);
            setPieData(Object.entries(dash.statusDistribution).map(([name, val]) => ({
              name,
              value: total > 0 ? Math.round((Number(val) / total) * 100) : 0,
              color: PIE_COLORS[name] ?? '#AAA',
            })));
          } else {
            setPieData([]);
          }
        }

        // 2. Recent orders
        const ordersRes = await fetch(`${API_BASE}/vendors/${SELLER_ID}/orders`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setRecent(orders.slice(0, 5)); // latest 5 only
        } else {
          setRecent([]);
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setWeekly([]);
        setMonthly([]);
        setPieData([]);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [SELLER_ID]);

  // ── Derived stats ──
  const ordersToday  = stats ? stats.ordersToday : 0;
  const revenueToday = stats ? fmtLKR(stats.revenueToday) : '0';
  const totalProducts = stats ? stats.totalProducts : 0;

  return (
    <div className="sd-page">

      {/* ── Welcome Banner ── */}
      <div className="sd-banner">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>Here's what's happening with your shop today.</p>
        </div>
        <div className="sd-banner-date">
          <p className="date-label">Today</p>
          <p className="date-value">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="sd-stats-grid">
        <StatCard icon={<FaShoppingCart />} title="Orders Today"   value={ordersToday} sub="Updated live" />
        <StatCard icon={<FaDollarSign />}   title="Revenue Today"  value={`LKR ${revenueToday}`} sub="Gross sales" />
        <StatCard icon={<FaBoxOpen />}      title="Total Products" value={totalProducts} sub="Active catalog items" />
        <StatCard icon={<FaStar />}         title="Avg Rating"     value="N/A" sub="No ratings yet" />
      </div>

      {/* ── Charts Row 1: Orders + Revenue ── */}
      <div className="sd-charts-row">
        <ChartCard style={{ flex: 2 }}>
          <SectionTitle title="Weekly Sales Trend" />
          <div className="sd-chart-wrap">
            {weekly.length === 0 ? (
              <div className="empty-chart-placeholder">No weekly sales records yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weekly}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#7A869A', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7A869A', fontSize: 11 }} tickFormatter={(v) => `LKR ${v/1000}k`} />
                  <Tooltip content={<CustomTooltip prefix="LKR " />} cursor={{ stroke: '#C9A84C', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C9A84C" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard style={{ flex: 1.2 }}>
          <SectionTitle title="Weekly Order Count" />
          <div className="sd-chart-wrap">
            {weekly.length === 0 ? (
              <div className="empty-chart-placeholder">No weekly orders yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#7A869A', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7A869A', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" name="Orders" fill="#1A2340" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Orders List + Status Distribution ── */}
      <div className="sd-bottom-row">
        
        {/* Left: Recent Orders */}
        <div className="sd-orders-list-card">
          <SectionTitle title="Recent Incoming Orders" />
          
          <div className="sd-table-wrap">
            {recent.length === 0 ? (
              <div className="empty-table-placeholder">
                <FaClock size={36} style={{ color: '#C9A84C', opacity: 0.5, marginBottom: '12px' }} />
                <p>No orders received yet.</p>
              </div>
            ) : (
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Destination</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.order_id} className={o.status === 'PENDING' ? 'sd-tr-pending-special' : ''}>
                      <td className="sd-td-id">#{o.order_id}</td>
                      <td>{o.delivery_address}</td>
                      <td className="sd-td-time">{timeAgo(o.created_at)}</td>
                      <td><StatusPill status={o.status} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>LKR {fmtLKR(o.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Status Pie Chart */}
        <ChartCard style={{ flex: 1 }}>
          <SectionTitle title="Order Fulfilment Status" />
          <div className="sd-pie-wrap">
            {pieData.length === 0 ? (
              <div className="empty-chart-placeholder">No order status breakdown available.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="sd-pie-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="legend-label">{d.name} ({d.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ChartCard>

      </div>

    </div>
  );
};

export default VendorDashboard;