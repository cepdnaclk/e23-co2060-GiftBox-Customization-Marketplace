// Orders.jsx
// This page shows the logged-in customer's past and current orders.
// Customer can see: order date, items, total price, and delivery status.
// They can also click on any order to see full details (OrderDetail page).

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/api';
import './Orders.css';

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
// This is fake/sample data so the page works without a backend.
// Later, replace this with a real API call to Spring Boot:
// GET /api/orders/customer/{customerId}

const sampleOrders = [
  {
    id: 'ORD-1001',
    date: '2026-04-20',
    status: 'Delivered',
    items: [
      { name: 'Chocolate Box', emoji: '🍫', qty: 2 },
      { name: 'Scented Candle', emoji: '🕯️', qty: 1 },
    ],
    ribbonColor: 'Gold',
    boxSize: 'Medium',
    message: 'Happy Birthday!',
    total: 2480,
  },
  {
    id: 'ORD-1002',
    date: '2026-04-25',
    status: 'Out for Delivery',
    items: [
      { name: 'Teddy Bear', emoji: '🧸', qty: 1 },
      { name: 'Dried Flowers', emoji: '💐', qty: 1 },
      { name: 'Cookie Tin', emoji: '🍪', qty: 1 },
    ],
    ribbonColor: 'Rose',
    boxSize: 'Large',
    message: 'Thinking of you!',
    total: 3310,
  },
  {
    id: 'ORD-1003',
    date: '2026-04-28',
    status: 'Processing',
    items: [
      { name: 'Wine Bottle', emoji: '🍷', qty: 1 },
      { name: 'Ceramic Mug', emoji: '☕', qty: 2 },
    ],
    ribbonColor: 'Ruby',
    boxSize: 'Medium',
    message: '',
    total: 4180,
  },
  {
    id: 'ORD-1004',
    date: '2026-04-29',
    status: 'Pending',
    items: [
      { name: 'Spa Kit', emoji: '🧴', qty: 1 },
      { name: 'Tea Collection', emoji: '🍵', qty: 1 },
    ],
    ribbonColor: 'Teal',
    boxSize: 'Small',
    message: 'Relax and enjoy!',
    total: 1870,
  },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Each status has a colour and an emoji for easy visual reading
const statusConfig = {
  'Pending':          { color: '#EF9F27', bg: 'rgba(239,159,39,0.1)',  emoji: '🕐' },
  'Processing':       { color: '#378ADD', bg: 'rgba(55,138,221,0.1)',  emoji: '⚙️' },
  'Out for Delivery': { color: '#7F77DD', bg: 'rgba(127,119,221,0.1)', emoji: '🚚' },
  'Delivered':        { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  emoji: '📦' },
  'Received':         { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  emoji: '✅' },
  'Cancelled':        { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)',   emoji: '❌' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Orders() {
  // orders — list of orders to display
  // starts empty, gets filled by the API call in useEffect
  const [orders, setOrders] = useState([]);

  // loading — true while waiting for API response
  const [loading, setLoading] = useState(true);

  // filter — which status tab is active ('All', 'Pending', 'Delivered' etc.)
  const [filter, setFilter] = useState('All');

  // navigate — used to go to OrderDetail page when order is clicked
  const navigate = useNavigate();

  // State to track which order is expanded and its items
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // ── Fetch orders from Spring Boot API ──────────────────────────────────────
  // useEffect runs once when the page first loads.
  // localStorage.getItem('userId') — userId saved at login time
  useEffect(() => {
    async function fetchOrders() {
      try {
        // Read the logged-in customer's userId from localStorage
        const customerId = localStorage.getItem('userId');

        if (!customerId) {
          // If no userId, show sample data and redirect to login page
          console.warn('No userId found. Showing sample data.');
          setOrders(sampleOrders);
          setLoading(false);
          return;
        }

        // GET /api/customers/{customerId}/orders — fetches ONLY this customer's orders
        const response = await apiCall(`/api/customers/${customerId}/orders`);

        if (response.ok) {
          const data = await response.json();
          // Map backend response fields to the frontend display format
          const mapped = data.map(o => ({
            id: `ORD-${o.orderId || o.order_id}`,
            date: o.createdAt || o.created_at,
            status: mapStatus(o.status),
            items: [],           // order items separate endpoint — later
            boxSize: o.boxSize || o.box_size || 'Standard',
            ribbonColor: o.wrappingStyle || o.wrapping_style || '—',
            message: o.giftMessage || o.gift_message || '',
            total: o.totalAmount || o.total_amount || 0,
          }));
          setOrders(mapped);
        } else {
          console.warn('API not available, using sample data');
          setOrders(sampleOrders);
        }
      } catch (error) {
        console.error('Orders API error:', error);
        setOrders(sampleOrders);
      } finally {
        setLoading(false);
      }
    }

    // DB status → display status map
    function mapStatus(dbStatus) {
      const map = {
        'PENDING':    'Pending',
        'CONFIRMED':  'Processing',
        'RECEIVED':   'Received',
        'ASSEMBLING': 'Processing',
        'READY':      'Processing',
        'SHIPPED':    'Out for Delivery',
        'DELIVERED':  'Delivered',
        'CANCELLED':  'Cancelled',
      };
      return map[dbStatus] || dbStatus;
    }

    fetchOrders();
  }, []); // empty [] means: run this only once when page loads


  // ── Filter orders based on active tab ─────────────────────────────────────
  // If filter is 'All', show everything.
  // Otherwise only show orders matching the selected status.
  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter((order) => order.status === filter);

  // ── Format date nicely ─────────────────────────────────────────────────────
  // Converts '2026-04-20' → 'April 20, 2026'
  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ── Handle order expansion ────────────────────────────────────────────────
  async function handleExpandOrder(order) {
    // If already expanded, collapse it
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }
    
    // Otherwise expand and fetch items
    setExpandedOrderId(order.id);
    setItemsLoading(true);
    setExpandedItems([]);

    try {
      const rawId = order.id.replace('ORD-', '');
      const res = await apiCall(`/api/orders/${rawId}/items`);
      if (res.ok) {
        const items = await res.json();
        setExpandedItems(items);
      }
    } catch (e) {
      console.error('Failed to fetch order items', e);
    } finally {
      setItemsLoading(false);
    }
  }

      // ── Handle mark as received ───────────────────────────────────────────────
  async function handleMarkReceived(order, e) {
    e.stopPropagation(); // prevent collapsing the card
    try {
      const rawId = order.id.replace('ORD-', '');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/${rawId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'RECEIVED' })
      });
      if (res.ok) {
        // Update local order list status
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Received' } : o));
      } else {
        alert('Could not update order status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status.');
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="orders-page">

      {/* ── Hero Banner ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1" />
        <div className="ct-hero__orb ct-hero__orb--2" />
        <div className="ct-hero__inner">
          <div className="ct-hero__label">Your Orders</div>
          <h1 className="ct-hero__title">My Orders</h1>
          <p className="ct-hero__sub">Track and manage your gift box orders</p>
        </div>
      </div>

      <div className="orders-body">

      {/* ── Page Header ── */}
      <div className="orders-header">
        <div>
          <p className="orders-subtitle">Showing {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      {/* These tabs let customer filter by order status */}
      <div className="orders-tabs">
        {['All', 'Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Received', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            className={`orders-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            {/* Show count badge on 'All' tab */}
            {tab === 'All' && (
              <span className="orders-tab-count">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading State ── */}
      {/* Shown while waiting for API response */}
      {loading && (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders...</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {/* Shown when customer has no orders or filter matches nothing */}
      {!loading && filteredOrders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-emoji">📦</div>
          <h3>No orders found</h3>
          <p>
            {filter === 'All'
              ? "You haven't placed any orders yet."
              : `No orders with status "${filter}".`}
          </p>
          <button
            className="ct-btn-gold"
            onClick={() => navigate('/customer/build-box')}
          >
            Start Your First Box
          </button>
        </div>
      )}

      {/* ── Orders List ── */}
      {/* Renders one card per order */}
      {!loading && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            // Get the colour/emoji config for this order's status
            const statusStyle = statusConfig[order.status] || statusConfig['Pending'];

            return (
              <div
                key={order.id}
                className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`}
                onClick={() => handleExpandOrder(order)}
                style={{ cursor: 'pointer' }}
              >

                {/* ── Card Top Row: Order ID + Status ── */}
                <div className="order-card-top">
                  <div className="order-id-group">
                    <span className="order-id">{order.id}</span>
                    <span className="order-date">{formatDate(order.date)}</span>
                  </div>
                  {/* Status badge with dynamic colour */}
                  <span
                    className="order-status"
                    style={{
                      color: statusStyle.color,
                      background: statusStyle.bg,
                    }}
                  >
                    {statusStyle.emoji} {order.status}
                  </span>
                </div>

                {/* ── Expanded Content: Items list ── */}
                {expandedOrderId === order.id && (
                  <div className="order-expanded-content" style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--ct-text)' }}>Order Items</h4>
                    {itemsLoading ? (
                      <p style={{ fontSize: '13px', color: 'var(--ct-text-muted)' }}>Loading items...</p>
                    ) : expandedItems.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--ct-text-muted)' }}>No items found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {expandedItems.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.imageUrl ? <img src={item.imageUrl} alt="" style={{width: 24, height: 24, borderRadius: 4, objectFit: 'cover'}}/> : '📦'}
                              {item.name} <span style={{ color: 'var(--ct-text-muted)' }}>× {item.quantity}</span>
                            </span>
                            <span>Rs {(item.unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {order.status === 'Delivered' && (
                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="ct-btn-gold" 
                          onClick={(e) => handleMarkReceived(order, e)}
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          Mark as Received
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Card Bottom: Total ── */}
                <div className="order-card-bottom" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: expandedOrderId === order.id ? 'none' : '1px solid rgba(0,0,0,0.05)', paddingTop: expandedOrderId === order.id ? '0' : '16px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ct-gold)' }}>Total Amount</span>
                  <div className="order-total" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ct-gold)' }}>
                    Rs {order.total.toLocaleString()}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      </div>{/* end orders-body */}
    </div>
  );
}