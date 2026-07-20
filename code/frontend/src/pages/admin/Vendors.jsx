import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaClock, FaArrowRight, FaMapMarkerAlt, FaUser, 
  FaEnvelope, FaPhone, FaCalendarCheck, FaChevronDown, 
  FaChevronUp, FaStore, FaBell 
} from 'react-icons/fa';
import './Vendors.css';

/**
 * Vendors Component
 * Displays active vendors/sellers with expandable details
 * Shows pending requests count and allows navigation to pending page
 */
const Vendors = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [activeSellers, setActiveSellers] = useState([]); 
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch active and pending vendors from backend API on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/vendors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(data => {
        // Count pending vendors
        const pending = data.filter(p => p.status === 'PENDING').length;
        setPendingCount(pending);

        // Filter and map active vendors to local state structure
        const active = data
          .filter(p => p.status === 'ACTIVE')
          .map(p => ({
            id: p.vendorId,
            shop: p.shopName,
            name: p.fullName,
            address: p.shopAddress,
            email: p.email || 'No Email',
            phone: p.phoneNumber,
            br_no: p.brNo,
            joined: new Date().toLocaleDateString()
          }));
        
        setActiveSellers(active);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vendors:", err);
        setLoading(false);
      });
  }, []);

  /**
   * Toggle expanded state for vendor card
   * Shows/hides detailed information section
   * @param {number} id - Vendor ID to toggle
   */
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="partners-container">
      
      {/* Page header with title and pending alert notification */}
      <div className="partners-header">
        <div className="header-text">
          <h1 className="page-title">Vendors Management</h1>
          <p className="page-subtitle">Manage your business vendors and monitor pending requests</p>
        </div>

        {/* Pending request alert button with notification badge */}
        {pendingCount > 0 && (
          <div className="pending-alert-wrapper">
            <button 
              onClick={() => navigate('/admin/vendors/pending')} 
              className="pending-alert-btn"
            >
              <div className="alert-icon-wrapper">
                <FaBell className="bell-icon" />
                <span className="pulse-dot"></span>
              </div>
              
              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-count">{pendingCount}</span>
                  <span className="alert-text">Pending Request{pendingCount > 1 ? 's' : ''}</span>
                </div>
                <span className="alert-subtext">Requires your attention</span>
              </div>
              
              <FaArrowRight className="alert-arrow" />
            </button>
          </div>
        )}
      </div>

      {/* Statistics cards showing vendor overview */}
      <div className="stats-grid">
        <div className="stat-card active-card">
          <div className="stat-icon active">
            <FaStore size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{activeSellers.length}</h3>
            <p className="stat-label">Active Vendors</p>
            <div className="stat-trend positive">
              <span>●</span> All systems operational
            </div>
          </div>
        </div>
        
        <div className="stat-card pending-card">
          <div className="stat-icon pending">
            <FaClock size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{pendingCount}</h3>
            <p className="stat-label">Pending Requests</p>
            <div className={`stat-trend ${pendingCount > 0 ? 'warning' : 'neutral'}`}>
              <span>●</span> {pendingCount > 0 ? 'Action required' : 'No pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Section header with filter actions */}
      <div className="section-header">
        <h3 className="section-title">Active Vendors</h3>
        <div className="section-actions">
          <button className="filter-btn">
            <span>All Vendors</span>
            <FaChevronDown size={12} />
          </button>
        </div>
      </div>

      <div className="partners-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontWeight: '500' }}>
            Loading vendors...
          </div>
        ) : activeSellers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FaStore size={56} className="empty-icon" />
            </div>
            <h3 className="empty-title">No Active Vendors</h3>
            <p className="empty-text">There are currently no active vendors in the system.</p>
          </div>
        ) : (
          activeSellers.map((seller) => (
            <div 
              key={seller.id} 
              className={`partner-card ${expandedId === seller.id ? 'expanded' : ''}`}
            >
              
              {/* Vendor card header with shop info and expand toggle */}
              <div 
                onClick={() => toggleExpand(seller.id)} 
                className="card-header"
              >
                <div className="header-left">
                  <div className="shop-avatar">
                    <FaStore size={20} />
                  </div>
                  <div className="header-info">
                    <div className="shop-name">{seller.shop}</div>
                    <div className="card-meta">
                      <span className="meta-item">
                        <FaUser size={12}/> {seller.name}
                      </span>
                      <span className="meta-item">
                        <FaMapMarkerAlt size={12}/> {seller.address}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="header-right">
                  <span className="status-badge active">Active</span>
                  <div className="expand-icon">
                    {expandedId === seller.id ? 
                      <FaChevronUp size={18} /> : 
                      <FaChevronDown size={18} />
                    }
                  </div>
                </div>
              </div>

              {/* Expanded details section with contact and action buttons */}
              {expandedId === seller.id && (
                <div className="details-section">
                  <div className="details-grid">
                    <div className="info-block">
                      <label className="info-label">
                        <FaEnvelope className="label-icon" />
                        Email Address
                      </label>
                      <div className="info-value">{seller.email}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        <FaPhone className="label-icon" />
                        Phone Number
                      </label>
                      <div className="info-value">{seller.phone}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        Business Registration
                      </label>
                      <div className="info-value">{seller.br_no}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        <FaCalendarCheck className="label-icon" />
                        Joined Date
                      </label>
                      <div className="info-value">{seller.joined}</div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="action-btn secondary">View Details</button>
                    <button className="action-btn primary">Manage Shop</button>
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

export default Vendors;