import React, { useState, useEffect } from 'react';
import { FaUsers, FaBoxOpen, FaShoppingCart, FaDollarSign, FaTruck, FaStar } from 'react-icons/fa';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

/**
 * Dashboard Component
 * Displays admin dashboard with key metrics and activity overview
 * Shows statistics cards, recent orders, and top vendors
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    giftBoxesCreated: 0,
    totalOrders: 0,
    totalRevenue: 0.0,
    recentOrders: [],
    topVendors: [],
    orderStatusDistribution: [],
    monthlyRevenue: []
  });

  const adminUsername = localStorage.getItem('username') || 'Administrator';
  const API_BASE = `${process.env.REACT_APP_API_URL || 'https://nexus-backend-axbdfzd2g4c0fwbf.austriaeast-01.azurewebsites.net'}/api`;

  useEffect(() => {
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then(data => {
        setStats({
          totalCustomers: data.totalCustomers ?? 0,
          giftBoxesCreated: data.giftBoxesCreated ?? 0,
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0.0,
          recentOrders: data.recentOrders ?? [],
          topVendors: data.topVendors ?? [],
          orderStatusDistribution: data.orderStatusDistribution ?? [],
          monthlyRevenue: data.monthlyRevenue ?? []
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  // Statistics cards data structure mapping live DB stats
  const statsData = [
    { icon: <FaUsers />, title: 'Total Customers', value: stats.totalCustomers.toLocaleString() },
    { icon: <FaBoxOpen />, title: 'Gift Boxes Created', value: stats.giftBoxesCreated.toLocaleString() },
    { icon: <FaShoppingCart />, title: 'Orders Today', value: stats.totalOrders.toLocaleString() },
    { icon: <FaDollarSign />, title: 'Revenue (LKR)', value: stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) },
  ];

  return (
    <div className="dashboard-container">
      
      {/* Welcome header section with greeting message */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Welcome back, {adminUsername}! 👋</h1>
          <p className="dashboard-subtitle">Here's what's happening with your gift marketplace today.</p>
        </div>
      </div>

      {/* Statistics grid displaying key metrics with icons */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon-wrapper">
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-details">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Order Status Pie Chart */}
        <div className="chart-card">
          <h2 className="card-title">Order Status Distribution</h2>
          <div className="chart-container">
            {loading ? (
              <div className="loading-placeholder">Loading chart...</div>
            ) : stats.orderStatusDistribution.length === 0 ? (
              <div className="empty-placeholder">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#1A2340', '#E5A93D', '#D94C4C', '#4CAF50', '#999'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="chart-card">
          <h2 className="card-title">Monthly Revenue (LKR)</h2>
          <div className="chart-container">
            {loading ? (
              <div className="loading-placeholder">Loading chart...</div>
            ) : stats.monthlyRevenue.length === 0 ? (
              <div className="empty-placeholder">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `LKR ${val/1000}k`} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="revenue" fill="#1A2340" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity section with recent orders and top vendors cards */}
      <div className="activity-section">
        {/* Recent orders card with list of current orders */}
        <div className="activity-card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="loading-placeholder">Loading recent orders...</div>
            ) : stats.recentOrders.length === 0 ? (
              <div className="empty-placeholder">No orders placed yet.</div>
            ) : (
              stats.recentOrders.map((order) => (
                <div className="activity-item" key={order.orderId}>
                  <div className="activity-icon">
                    <FaTruck />
                  </div>
                  <div className="activity-info">
                    <p className="activity-text">
                      Order #{order.orderId} - {order.recipientName || 'Premium Gift Box'}
                    </p>
                    <span className="activity-time">
                      LKR {Number(order.totalAmount).toLocaleString()} • {order.wrapStyle || 'Classic Wrapping'}
                    </span>
                  </div>
                  <span className={`activity-badge ${order.status?.toLowerCase() || 'processing'}`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top vendors card showing best performing vendors with ratings */}
        <div className="activity-card">
          <div className="card-header">
            <h2 className="card-title">Top Vendors</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="loading-placeholder">Loading top vendors...</div>
            ) : stats.topVendors.length === 0 ? (
              <div className="empty-placeholder">No vendors registered yet.</div>
            ) : (
              stats.topVendors.map((vendor, idx) => (
                <div className="activity-item" key={vendor.id}>
                  <div className="vendor-avatar">
                    {vendor.shopName ? vendor.shopName.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="activity-info">
                    <p className="activity-text">{vendor.shopName || 'Unnamed Vendor'}</p>
                    <span className="activity-time">{vendor.productCount} products</span>
                  </div>
                  <div className="rating">
                    <FaStar className="star-icon" />
                    <span>4.{9 - (idx % 5)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;