import React, { useState, useEffect, useMemo } from 'react';
import './Orders.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

// Status progression order as defined in the database
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'RECEIVED', 'ASSEMBLING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function fmtLKR(n) {
  return Number(n || 0).toLocaleString('en-LK');
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, badge, badgeType }) {
  return (
    <div className="orders-stat-card">
      <div className="orders-stat-label">{label}</div>
      <div className="orders-stat-value">{value}</div>
      {badge && <div className={`orders-stat-badge badge-${badgeType}`}>{badge}</div>}
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`orders-status-pill status-${status?.toLowerCase()}`}>{status}</span>;
}

function Avatar({ name, index }) {
  const AVATAR_BG = ['#e8b84b', '#4a90d9', '#e07b5a', '#5ab88a', '#9b7ee0'];
  const i = index % AVATAR_BG.length;
  return (
    <div className="orders-avatar" style={{ background: AVATAR_BG[i], color: '#fff' }}>
      {initials(name)}
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  if (!order) return null;

  // Get the current step index to highlight the timeline correctly
  const step = STATUS_ORDER.indexOf(order.status);
  const timelineSteps = ['Order Placed', 'Confirmed', 'Ready', 'Shipped', 'Delivered'];

  return (
    <div className="orders-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal">
        <div className="orders-modal-head">
          <div className="orders-modal-head-left">
            <span className="orders-modal-id">#{order.order_id}</span>
            <StatusPill status={order.status} />
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="orders-modal-body">
          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Order Info</div>
            <div className="orders-modal-info-grid">
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Address</span>
                <span className="orders-modal-info-val">{order.delivery_address}</span>
              </div>
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Total Amount</span>
                <span className="orders-modal-info-val">LKR {fmtLKR(order.total_amount)}</span>
              </div>
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Special Notes</span>
                <span className="orders-modal-info-val">{order.special_notes || 'No notes'}</span>
              </div>
            </div>
          </div>

          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Order Timeline</div>
            {order.status === 'CANCELLED' ? (
              <div className="orders-cancelled-notice">This order has been cancelled.</div>
            ) : (
              <div className="orders-timeline">
                {timelineSteps.map((s, j) => (
                  <div className="orders-tl-step" key={j}>
                    <div className={`orders-tl-dot ${j <= step ? 'done' : 'todo'}`} />
                    <div className="orders-tl-label">{s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vendor Actions: only shown for PENDING orders */}
          {order.status === 'PENDING' && (
            <div className="orders-modal-section">
              <div className="orders-modal-section-title">Update Status</div>
              <div className="orders-status-btns">
                <button className="orders-status-update-btn" onClick={() => onStatusChange(order.order_id, 'CONFIRMED')}>
                  Confirm Order
                </button>
                <button className="orders-status-update-btn cancel-btn" onClick={() => onStatusChange(order.order_id, 'CANCELLED')}>
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const PER_PAGE = 8;

  // 1. Fetch orders from backend using the logged-in seller's userId from localStorage
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Read the logged-in vendor's userId from localStorage
      const sellerId = localStorage.getItem('userId');

      if (!sellerId) {
        console.warn('No userId found in localStorage. Please login again.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/vendors/${sellerId}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Status Change (Accept/Cancel)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");

      setOrders(prev => prev.map(o => o.order_id === id ? { ...o, status: newStatus } : o));
      setSelected(null);
      setToast(`Order #${id} marked as ${newStatus}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Error updating status");
    }
  };

  // ── Filtered + paginated data ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchStatus = filter === 'All' || o.status === filter;
      const matchSearch = !q || o.order_id.toString().includes(q) || (o.delivery_address && o.delivery_address.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageSlice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total_amount), 0),
  }), [orders]);

  return (
    <div className="orders-page">
      <div className="orders-page-header">
        <div>
          <h1 className="orders-page-title">Order Management</h1>
          <p className="orders-page-sub">Track, filter and update all your customer orders</p>
        </div>
        <button className="orders-export-btn">Export CSV</button>
      </div>

      {/* Stats Row */}
      <div className="orders-stats-row">
        <StatCard label="Total Orders" value={stats.total} badge="All time" badgeType="neutral" />
        <StatCard label="Pending" value={stats.pending} badge="Needs attention" badgeType="warning" />
        <StatCard label="Delivered" value={stats.delivered} badge={`${stats.total > 0 ? Math.round(stats.delivered / stats.total * 100) : 0}% rate`} badgeType="success" />
        <StatCard label="Revenue (LKR)" value={fmtLKR(stats.revenue)} badge="+15.3% vs yesterday" badgeType="success" />
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <input
          className="orders-search-input"
          type="text"
          placeholder="Search by order ID or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="orders-filter-tabs">
          {['All', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(f => (
            <button key={f} className={`orders-filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="orders-table-wrap">
        {loading ? (
          <div className="orders-empty">Loading orders...</div>
        ) : pageSlice.length === 0 ? (
          <div className="orders-empty">No orders match your filters</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Address</th>
                <th>Date</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((order, i) => (
                <tr key={order.order_id} className={`orders-table-row ${order.status === 'PENDING' ? 'orders-row-pending-special' : ''}`}>
                  <td className="orders-order-id">#{order.order_id}</td>
                  <td>{order.delivery_address}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="orders-total-cell">{fmtLKR(order.total_amount)}</td>
                  <td><StatusPill status={order.status} /></td>
                  <td>
                    <button className="orders-action-btn view" onClick={() => setSelected(order)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      {toast && <div className="orders-toast">{toast}</div>}
    </div>
  );
};

export default Orders;