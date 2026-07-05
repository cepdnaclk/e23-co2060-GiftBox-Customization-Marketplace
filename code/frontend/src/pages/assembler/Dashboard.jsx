import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaClipboardCheck, FaCheckDouble, FaShippingFast } from 'react-icons/fa';
import './Dashboard.css';

// ── Config ────────────────────────────────────────────────────
const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

// ── Helper Sub-components ──────────────────────────────────────
const StatCard = ({ icon, title, value }) => (
  <div className="asm-stat-card">
    <div className="asm-stat-icon">{icon}</div>
    <div className="asm-stat-body">
      <p className="asm-stat-title">{title}</p>
      <h3 className="asm-stat-value">{value}</h3>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const AssemblerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock initial fetch. In reality, you'd fetch from `/api/orders` where status is CONFIRMED, RECEIVED, ASSEMBLING, etc.
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // NOTE: Replace this with actual backend API when ready
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        let data = await res.json();
        // Filter out orders that are standard (no box customization) or already delivered
        data = data.filter(o => o.boxSize && o.status !== 'DELIVERED');
        setOrders(data);
      } else {
        // Fallback Mock Data if API fails or doesn't support fetching all orders yet
        setOrders([
          { orderId: 101, customerName: 'Hasini K.', boxSize: 'LARGE', occasion: 'Birthday', status: 'CONFIRMED' },
          { orderId: 102, customerName: 'Test User', boxSize: 'MEDIUM', occasion: 'Anniversary', status: 'RECEIVED' },
          { orderId: 103, customerName: 'Alice M.', boxSize: 'SMALL', occasion: 'Graduation', status: 'ASSEMBLING' }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch orders, using mock data", error);
      // Fallback Mock Data
      setOrders([
        { orderId: 101, customerName: 'Hasini K.', boxSize: 'LARGE', occasion: 'Birthday', status: 'CONFIRMED' },
        { orderId: 102, customerName: 'Test User', boxSize: 'MEDIUM', occasion: 'Anniversary', status: 'RECEIVED' },
        { orderId: 103, customerName: 'Alice M.', boxSize: 'SMALL', occasion: 'Graduation', status: 'ASSEMBLING' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update locally immediately for better UX
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));

      // Make API call to backend
      const res = await fetch(`${API_BASE}/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      
      if (!res.ok) {
        console.error("Failed to update status on server");
        // In a real app, you might want to revert the local change here if it fails
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const assemblingCount = orders.filter(o => o.status === 'RECEIVED' || o.status === 'ASSEMBLING').length;
  const readyCount = orders.filter(o => o.status === 'QA_PASSED' || o.status === 'READY').length;

  return (
    <div className="asm-page">
      {/* ── Welcome Banner ── */}
      <div className="asm-banner">
        <div>
          <h1>Assembly Workflow Module</h1>
          <p>Track, manage, and assemble custom gift boxes.</p>
        </div>
        <div className="asm-banner-date">
          <p className="date-label">Today</p>
          <p className="date-value">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="asm-stats-grid">
        <StatCard icon={<FaBoxOpen />} title="Pending Receipts" value={pendingCount} />
        <StatCard icon={<FaClipboardCheck />} title="In Assembly" value={assemblingCount} />
        <StatCard icon={<FaCheckDouble />} title="QA Passed" value={readyCount} />
        <StatCard icon={<FaShippingFast />} title="Total Handled" value={orders.length} />
      </div>

      {/* ── Orders Table ── */}
      <div className="asm-card">
        <div className="asm-section-title">
          <h2>Gift Box Queue</h2>
          <button className="asm-btn" onClick={fetchOrders}>Refresh Queue</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#7A869A', padding: '20px' }}>Loading orders...</p>
        ) : (
          <table className="asm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Box Size</th>
                <th>Occasion</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No orders in queue.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="asm-order-id">#{order.orderId}</td>
                    <td>{order.customerName || `Customer #${order.customerId}`}</td>
                    <td><strong style={{ color: '#1A2340' }}>{order.boxSize || 'Standard'}</strong></td>
                    <td>{order.occasion || 'N/A'}</td>
                    <td>
                      <select 
                        className="asm-status-select"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED (Awaiting Receipt)</option>
                        <option value="RECEIVED">RECEIVED (Items Arrived)</option>
                        <option value="ASSEMBLING">ASSEMBLING (In Progress)</option>
                        <option value="QA_PASSED">QA PASSED</option>
                        <option value="READY">READY FOR DELIVERY</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {order.status === 'CONFIRMED' && (
                        <button className="asm-btn" onClick={() => updateOrderStatus(order.orderId, 'RECEIVED')}>
                          Mark Received
                        </button>
                      )}
                      {order.status === 'RECEIVED' && (
                        <button className="asm-btn" onClick={() => updateOrderStatus(order.orderId, 'ASSEMBLING')}>
                          Start Assembly
                        </button>
                      )}
                      {order.status === 'ASSEMBLING' && (
                        <button className="asm-btn" onClick={() => updateOrderStatus(order.orderId, 'QA_PASSED')}>
                          Pass QA
                        </button>
                      )}
                      {order.status === 'QA_PASSED' && (
                        <button className="asm-btn" onClick={() => updateOrderStatus(order.orderId, 'READY')}>
                          Mark Ready
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssemblerDashboard;
