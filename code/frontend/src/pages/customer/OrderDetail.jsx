// OrderDetail.jsx
// This page shows the full details of a single order.
// It opens when a customer clicks on an order card in Orders.jsx.
//
// What this page shows:
// - Order ID, date, and current status
// - Delivery tracking steps (visual progress bar)
// - All items in the box with quantities and prices
// - Box details: size, ribbon color, personal message
// - Price breakdown and total
// - A button to go back to Orders page

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './OrderDetail.css';

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
// Same sample orders as Orders.jsx — used as fallback when backend is not ready.
// Later, this will be replaced by: GET /api/orders/{orderId}

const sampleOrders = [
  {
    id: 'ORD-1001',
    date: '2026-04-20',
    deliveryDate: '2026-04-23',
    status: 'Delivered',
    recipient: 'Nimasha Perera',
    address: '42 Galle Road, Colombo 03, Western Province',
    items: [
      { name: 'Chocolate Box',  emoji: '🍫', qty: 2, price: 450,  vendor: 'ChocoVend'  },
      { name: 'Scented Candle', emoji: '🕯️', qty: 1, price: 780,  vendor: 'GlowVend'   },
    ],
    ribbonColor: 'Gold',
    boxSize: 'Medium',
    boxPrice: 850,
    message: 'Happy Birthday!',
    total: 2480,
  },
  {
    id: 'ORD-1002',
    date: '2026-04-25',
    deliveryDate: '2026-04-30',
    status: 'Out for Delivery',
    recipient: 'Kasun Fernando',
    address: '15 Temple Road, Kandy, Central Province',
    items: [
      { name: 'Teddy Bear',    emoji: '🧸', qty: 1, price: 1100, vendor: 'ToyVend'   },
      { name: 'Dried Flowers', emoji: '💐', qty: 1, price: 590,  vendor: 'FloraVend' },
      { name: 'Cookie Tin',    emoji: '🍪', qty: 1, price: 420,  vendor: 'ChocoVend' },
    ],
    ribbonColor: 'Rose',
    boxSize: 'Large',
    boxPrice: 1200,
    message: 'Thinking of you!',
    total: 3310,
  },
  {
    id: 'ORD-1003',
    date: '2026-04-28',
    deliveryDate: '2026-05-02',
    status: 'Processing',
    recipient: 'Dinusha Silva',
    address: '8 Lake View, Battaramulla, Western Province',
    items: [
      { name: 'Wine Bottle',   emoji: '🍷', qty: 1, price: 2200, vendor: 'SipVend'  },
      { name: 'Ceramic Mug',   emoji: '☕', qty: 2, price: 380,  vendor: 'HomeVend' },
    ],
    ribbonColor: 'Ruby',
    boxSize: 'Medium',
    boxPrice: 850,
    message: '',
    total: 4180,
  },
  {
    id: 'ORD-1004',
    date: '2026-04-29',
    deliveryDate: '2026-05-03',
    status: 'Pending',
    recipient: 'Amaya Jayawardena',
    address: '23 Flower Road, Nugegoda, Western Province',
    items: [
      { name: 'Spa Kit',        emoji: '🧴', qty: 1, price: 650, vendor: 'GlowVend' },
      { name: 'Tea Collection', emoji: '🍵', qty: 1, price: 520, vendor: 'SipVend'  },
    ],
    ribbonColor: 'Teal',
    boxSize: 'Small',
    boxPrice: 500,
    message: 'Relax and enjoy!',
    total: 1870,
  },
];

// ─── TRACKING STEPS ───────────────────────────────────────────────────────────
// These are the 4 delivery stages every order goes through.
// We use the order's current status to highlight how far it has progressed.
const trackingSteps = [
  { key: 'Pending',          label: 'Order Placed',    emoji: '📋', desc: 'Your order has been received'          },
  { key: 'Processing',       label: 'Being Packed',    emoji: '📦', desc: 'Your gift box is being hand-packed'    },
  { key: 'Out for Delivery', label: 'Out for Delivery',emoji: '🚚', desc: 'Your box is on its way to you'         },
  { key: 'Delivered',        label: 'Delivered',       emoji: '✅', desc: 'Your gift box has been delivered'      },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Colour coding for the status badge — same as Orders.jsx
const statusConfig = {
  'Pending':          { color: '#EF9F27', bg: 'rgba(239,159,39,0.1)'  },
  'Processing':       { color: '#378ADD', bg: 'rgba(55,138,221,0.1)'  },
  'Out for Delivery': { color: '#7F77DD', bg: 'rgba(127,119,221,0.1)' },
  'Delivered':        { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)'  },
  'Cancelled':        { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)'   },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OrderDetail() {
  // order — the single order object to display, null while loading
  const [order, setOrder] = useState(null);

  // loading — true while fetching from API
  const [loading, setLoading] = useState(true);

  // useParams reads the order ID from the URL
  // Example: if URL is /orders/ORD-1001 → orderId = 'ORD-1001'
  // This is how we know WHICH order to show
  const { orderId } = useParams();

  // navigate — to go back to Orders page
  const navigate = useNavigate();

  // ── Fetch single order from Spring Boot API ───────────────────────────────
  // Runs once when page loads, uses orderId from URL to fetch the right order
  useEffect(() => {
    async function fetchOrder() {
      try {
        // TODO: replace with your real Spring Boot URL
        // This calls: GET /api/orders/ORD-1001
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`, {
          headers: {
            'Content-Type': 'application/json',
            // If using JWT: 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.ok) {
          // API worked — use real data
          const data = await response.json();
          setOrder(data);
        } else {
          // API failed — find the matching order in sample data
          const found = sampleOrders.find((o) => o.id === orderId);
          setOrder(found || null);
        }
      } catch (error) {
        // Backend not running — fall back to sample data
        console.error('OrderDetail API error:', error);
        const found = sampleOrders.find((o) => o.id === orderId);
        setOrder(found || null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]); // re-runs if orderId in URL changes

  // ── Helper: which step index is currently active ──────────────────────────
  // Returns 0 for Pending, 1 for Processing, 2 for Out for Delivery, 3 for Delivered
  function getActiveStep(status) {
    const index = trackingSteps.findIndex((s) => s.key === status);
    return index === -1 ? 0 : index;
  }

  // ── Helper: format date nicely ────────────────────────────────────────────
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  // ── Helper: calculate items subtotal ─────────────────────────────────────
  function itemsSubtotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="od-page">

      {/* ── Hero Banner ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1" />
        <div className="ct-hero__orb ct-hero__orb--2" />
        <div className="ct-hero__inner">
          <div className="ct-hero__label">Order Details</div>
          <h1 className="ct-hero__title">
            {loading ? 'Loading…' : order ? order.id : 'Order Not Found'}
          </h1>
          <p className="ct-hero__sub">
            {!loading && order ? `Placed on ${formatDate(order.date)}` : ''}
          </p>
        </div>
      </div>

      <div className="ct-body">

      {/* ── Back Button ── */}
      {/* Takes customer back to the Orders list page */}
      <button
        className="od-back-btn"
        onClick={() => navigate('/customer/orders')}
      >
        ← Back to Orders
      </button>

      {/* ── Loading State ── */}
      {loading && (
        <div className="od-loading">
          <div className="od-spinner" />
          <p>Loading order details...</p>
        </div>
      )}

      {/* ── Not Found State ── */}
      {/* Shown if no order matches the ID in the URL */}
      {!loading && !order && (
        <div className="od-not-found">
          <div className="od-not-found-emoji">🔍</div>
          <h3>Order not found</h3>
          <p>We couldn't find order <strong>{orderId}</strong>.</p>
          <button className="od-back-btn" onClick={() => navigate('/orders')}>
            Go back to Orders
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      {/* Only shown when order data is loaded successfully */}
      {!loading && order && (
        <div className="od-content">

          {/* ══ TOP SECTION: Order ID + Status ══ */}
          <div className="od-top">
            <div>
              <h1 className="od-order-id">{order.id}</h1>
              <p className="od-order-date">Placed on {formatDate(order.date)}</p>
            </div>
            {/* Status badge with dynamic colour */}
            <span
              className="od-status"
              style={{
                color: statusConfig[order.status]?.color || '#EF9F27',
                background: statusConfig[order.status]?.bg || 'rgba(239,159,39,0.1)',
              }}
            >
              {order.status}
            </span>
          </div>

          {/* ══ DELIVERY TRACKING BAR ══ */}
          {/* Visual progress showing which stage the order is at.
              Each step lights up gold when reached. */}
          <div className="od-card">
            <h3 className="od-card-title">Delivery Tracking</h3>
            <div className="od-tracking">
              {trackingSteps.map((step, idx) => {
                const activeIdx = getActiveStep(order.status);
                // A step is "done" if its index is <= the active step index
                const isDone    = idx <= activeIdx;
                // A step is "current" if it matches the active step exactly
                const isCurrent = idx === activeIdx;
                return (
                  <React.Fragment key={step.key}>
                    {/* Individual tracking step */}
                    <div className={`od-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="od-step-circle">
                        {isDone ? step.emoji : <span className="od-step-num">{idx + 1}</span>}
                      </div>
                      <div className="od-step-info">
                        <span className="od-step-label">{step.label}</span>
                        <span className="od-step-desc">{step.desc}</span>
                      </div>
                    </div>
                    {/* Connector line between steps — not after the last step */}
                    {idx < trackingSteps.length - 1 && (
                      <div className={`od-connector ${idx < activeIdx ? 'done' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Estimated delivery date */}
            <p className="od-delivery-date">
              📅 Estimated delivery: <strong>{formatDate(order.deliveryDate)}</strong>
            </p>
          </div>

          {/* ══ TWO COLUMN LAYOUT ══ */}
          {/* Left: items + box details | Right: recipient + price summary */}
          <div className="od-grid">

            {/* ── LEFT COLUMN ── */}
            <div className="od-left">

              {/* Items in the box */}
              <div className="od-card">
                <h3 className="od-card-title">Items in Your Box</h3>
                <div className="od-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="od-item-row">
                      <div className="od-item-left">
                        <span className="od-item-emoji">{item.emoji}</span>
                        <div className="od-item-info">
                          <span className="od-item-name">{item.name}</span>
                          {/* Vendor name shown in muted text */}
                          <span className="od-item-vendor">by {item.vendor}</span>
                        </div>
                      </div>
                      <div className="od-item-right">
                        <span className="od-item-qty">×{item.qty}</span>
                        <span className="od-item-price">Rs {item.price * item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box details: size, ribbon, message */}
              <div className="od-card">
                <h3 className="od-card-title">Box Details</h3>
                <div className="od-details-list">
                  <div className="od-detail-row">
                    <span className="od-detail-label">📦 Box Size</span>
                    <span className="od-detail-value">{order.boxSize}</span>
                  </div>
                  <div className="od-detail-row">
                    <span className="od-detail-label">🎀 Ribbon</span>
                    <span className="od-detail-value">{order.ribbonColor}</span>
                  </div>
                  {order.message ? (
                    <div className="od-detail-row">
                      <span className="od-detail-label">💬 Message</span>
                      <span className="od-detail-value od-message">"{order.message}"</span>
                    </div>
                  ) : (
                    <div className="od-detail-row">
                      <span className="od-detail-label">💬 Message</span>
                      <span className="od-detail-value" style={{ color: 'var(--od-muted)' }}>No message</span>
                    </div>
                  )}
                </div>
              </div>

            </div>{/* end od-left */}

            {/* ── RIGHT COLUMN ── */}
            <div className="od-right">

              {/* Recipient and delivery address */}
              <div className="od-card">
                <h3 className="od-card-title">Delivery Details</h3>
                <div className="od-details-list">
                  <div className="od-detail-row">
                    <span className="od-detail-label">👤 Recipient</span>
                    <span className="od-detail-value">{order.recipient}</span>
                  </div>
                  <div className="od-detail-row od-address-row">
                    <span className="od-detail-label">📍 Address</span>
                    <span className="od-detail-value">{order.address}</span>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="od-card">
                <h3 className="od-card-title">Price Summary</h3>
                <div className="od-price-rows">
                  <div className="od-price-row">
                    <span>Box ({order.boxSize})</span>
                    <span>Rs {order.boxPrice}</span>
                  </div>
                  <div className="od-price-row">
                    <span>Items ({order.items.length})</span>
                    <span>Rs {itemsSubtotal(order.items)}</span>
                  </div>
                  <div className="od-price-row">
                    <span>Delivery</span>
                    <span className="od-free">Free</span>
                  </div>
                </div>
                {/* Divider line */}
                <div className="od-price-divider" />
                {/* Total */}
                <div className="od-price-total">
                  <span>Total</span>
                  <span>Rs {order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="od-actions">
                {/* Only show "Build Another Box" if order is delivered */}
                {order.status === 'Delivered' && (
                  <button
                    className="od-btn-primary"
                    onClick={() => navigate('/customize')}
                  >
                    🎁 Build Another Box
                  </button>
                )}
                {/* Always show "Back to Orders" button */}
                <button
                  className="od-btn-secondary"
                  onClick={() => navigate('/orders')}
                >
                  View All Orders
                </button>
              </div>

            </div>{/* end od-right */}
          </div>{/* end od-grid */}
        </div>
      )}
      </div>{/* end ct-body */}
    </div>
  );
}