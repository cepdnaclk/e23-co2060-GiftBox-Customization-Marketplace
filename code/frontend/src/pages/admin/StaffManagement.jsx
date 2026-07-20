import React, { useState, useEffect } from 'react';
import {
  FaUserCog, FaPlus, FaToggleOn, FaToggleOff,
  FaKey, FaChevronDown, FaChevronUp, FaEnvelope,
  FaPhone, FaCalendarCheck, FaCheckCircle, FaTimesCircle,
  FaTasks, FaUsers
} from 'react-icons/fa';
import './StaffManagement.css';

/**
 * StaffManagement Component
 * Admin tab for managing assembler accounts
 * Allows creating, activating/deactivating, and viewing assembler stats
 */
const StaffManagement = () => {
  const [assemblers, setAssemblers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [newAssembler, setNewAssembler] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  // Fetch assemblers from backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/assemblers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : data.assemblers || data.content || [];
        setAssemblers(list);
        setStats({
          total: list.length,
          active: list.filter(a => a.status === 'ACTIVE').length,
          inactive: list.filter(a => a.status === 'INACTIVE').length
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching assemblers:', err);
        setLoading(false);
      });
  }, []);

  // Toggle assembler active/inactive status
  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    fetch(`${process.env.REACT_APP_API_URL}/api/assemblers/${id}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(updated => {
        setAssemblers(prev =>
          prev.map(a => a.assemblerId === id ? { ...a, status: newStatus } : a)
        );
        setStats(prev => ({
          ...prev,
          active: newStatus === 'ACTIVE' ? prev.active + 1 : prev.active - 1,
          inactive: newStatus === 'INACTIVE' ? prev.inactive + 1 : prev.inactive - 1
        }));
      })
      .catch(err => console.error('Error updating status:', err));
  };

  // Add new assembler account
  const handleAddAssembler = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/assemblers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ ...newAssembler, status: 'ACTIVE' })
    })
      .then(res => res.json())
      .then(created => {
        setAssemblers(prev => [...prev, created]);
        setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
        setShowAddForm(false);
        setNewAssembler({ fullName: '', email: '', phone: '', password: '' });
      })
      .catch(err => console.error('Error adding assembler:', err));
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="staff-container">

      {/* Page Header */}
      <div className="staff-header">
        <div className="header-text">
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage assembler accounts and monitor their activity</p>
        </div>
        <button className="add-assembler-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <FaPlus size={14} />
          Add New Assembler
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-card">
          <div className="stat-icon total">
            <FaUsers size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '—' : stats.total}</h3>
            <p className="stat-label">Total Assemblers</p>
            <div className="stat-trend neutral">
              <span>●</span> All staff members
            </div>
          </div>
        </div>

        <div className="stat-card active-card">
          <div className="stat-icon active">
            <FaCheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '—' : stats.active}</h3>
            <p className="stat-label">Active Assemblers</p>
            <div className="stat-trend positive">
              <span>●</span> Currently working
            </div>
          </div>
        </div>

        <div className="stat-card inactive-card">
          <div className="stat-icon inactive">
            <FaTimesCircle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '—' : stats.inactive}</h3>
            <p className="stat-label">Inactive Assemblers</p>
            <div className={`stat-trend ${stats.inactive > 0 ? 'warning' : 'neutral'}`}>
              <span>●</span> {stats.inactive > 0 ? 'Needs attention' : 'None inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Add Assembler Form */}
      {showAddForm && (
        <div className="add-form-card">
          <h3 className="form-title">
            <FaUserCog /> Add New Assembler
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={newAssembler.fullName}
                onChange={e => setNewAssembler({ ...newAssembler, fullName: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                value={newAssembler.email}
                onChange={e => setNewAssembler({ ...newAssembler, email: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={newAssembler.phone}
                onChange={e => setNewAssembler({ ...newAssembler, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Set initial password"
                value={newAssembler.password}
                onChange={e => setNewAssembler({ ...newAssembler, password: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="action-btn secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button className="action-btn primary" onClick={handleAddAssembler}>Create Account</button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="section-header">
        <h3 className="section-title">Assembler Accounts</h3>
      </div>

      {/* Assembler List */}
      <div className="staff-list">
        {loading ? (
          <div className="empty-state">
            <p className="empty-text">Loading assemblers...</p>
          </div>
        ) : assemblers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FaUserCog size={56} className="empty-icon" />
            </div>
            <h3 className="empty-title">No Assemblers Yet</h3>
            <p className="empty-text">Add your first assembler to get started.</p>
          </div>
        ) : (
          assemblers.map(assembler => (
            <div
              key={assembler.assemblerId}
              className={`staff-card ${expandedId === assembler.assemblerId ? 'expanded' : ''}`}
            >
              {/* Card Header */}
              <div className="card-header" onClick={() => toggleExpand(assembler.assemblerId)}>
                <div className="header-left">
                  <div className="staff-avatar">
                    <FaUserCog size={20} />
                  </div>
                  <div className="header-info">
                    <div className="staff-name">{assembler.fullName}</div>
                    <div className="card-meta">
                      <span className="meta-item">
                        <FaEnvelope size={12} /> {assembler.email}
                      </span>
                      <span className="meta-item">
                        <FaTasks size={12} /> {assembler.completedOrders || 0} orders done
                      </span>
                    </div>
                  </div>
                </div>
                <div className="header-right">
                  <span className={`status-badge ${assembler.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {assembler.status}
                  </span>
                  <div className="expand-icon">
                    {expandedId === assembler.assemblerId ?
                      <FaChevronUp size={18} /> :
                      <FaChevronDown size={18} />
                    }
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === assembler.assemblerId && (
                <div className="details-section">
                  <div className="details-grid">
                    <div className="info-block">
                      <label className="info-label">
                        <FaEnvelope className="label-icon" /> Email Address
                      </label>
                      <div className="info-value">{assembler.email}</div>
                    </div>
                    <div className="info-block">
                      <label className="info-label">
                        <FaPhone className="label-icon" /> Phone Number
                      </label>
                      <div className="info-value">{assembler.phone || 'Not provided'}</div>
                    </div>
                    <div className="info-block">
                      <label className="info-label">
                        <FaTasks className="label-icon" /> Orders Completed
                      </label>
                      <div className="info-value">{assembler.completedOrders || 0} orders</div>
                    </div>
                    <div className="info-block">
                      <label className="info-label">
                        <FaCalendarCheck className="label-icon" /> Joined Date
                      </label>
                      <div className="info-value">
                        {assembler.createdAt
                          ? new Date(assembler.createdAt).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn secondary"
                      onClick={() => alert('Password reset email sent!')}
                    >
                      <FaKey size={13} /> Reset Password
                    </button>
                    <button
                      className={`action-btn ${assembler.status === 'ACTIVE' ? 'danger' : 'success'}`}
                      onClick={() => toggleStatus(assembler.assemblerId, assembler.status)}
                    >
                      {assembler.status === 'ACTIVE'
                        ? <><FaToggleOff size={14} /> Deactivate</>
                        : <><FaToggleOn size={14} /> Activate</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
