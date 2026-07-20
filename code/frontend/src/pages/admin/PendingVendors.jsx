import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheck, FaTimes, FaMapMarkerAlt, 
  FaUser, FaPhone, FaStore, FaClock, FaEnvelope
} from 'react-icons/fa';
import './PendingVendors.css';

/**
 * PendingVendors Component
 * Displays a list of pending vendor applications
 * Allows admin to approve or reject vendor requests
 */
const PendingVendors = () => {
  const navigate = useNavigate();
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending vendors from backend API on component mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/vendors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(data => {
        // Filter for pending vendors and map to local state structure
        const pending = data
          .filter(p => p.status === 'PENDING')
          .map(p => ({
            id: p.vendorId,        
            shop: p.shopName,       
            name: p.fullName,       
            address: p.shopAddress, 
            phone: p.phoneNumber,   
            br_no: p.brNo,
            email: p.email || 'No Email',
            categories: p.categories || 'premium-gifts'
          }));
        setPendingSellers(pending);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  /**
   * Update vendor status via API call
   * Sends approval/rejection request to backend
   * Removes processed request from list on success
   * @param {number} id - Vendor ID
   * @param {string} newStatus - New status (ACTIVE or REJECTED)
   */
  const handleStatusUpdate = (id, newStatus) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/vendors/${id}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
    .then(response => {
      if (response.ok) {
        setPendingSellers(pendingSellers.filter(seller => seller.id !== id));
        console.log("Database updated successfully!");
      } else {
        alert("Failed to update status.");
      }
    })
    .catch(error => {
      console.error("Error connecting to backend:", error);
      alert("Error connecting to server.");
    });
  };

  return (
    <div className="pending-container">
      
      {/* Page header with navigation and title */}
      <div className="pending-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back to Vendors
        </button>
        <h1 className="page-title">Pending Requests</h1>
        <p className="page-subtitle">Review and approve new vendor applications</p>
      </div>

      {/* Statistics card showing pending request count */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '...' : pendingSellers.length}</h3>
            <p className="stat-label">Pending Requests</p>
          </div>
        </div>
      </div>

      {/* List of pending vendor requests */}
      <div className="pending-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontWeight: '500' }}>
            Loading pending requests...
          </div>
        ) : pendingSellers.length === 0 ? (
          <div className="empty-state">
            <FaClock size={48} className="empty-icon" />
            <p className="empty-text">No pending requests found.</p>
          </div>
        ) : (
          pendingSellers.map((seller) => (
            <div key={seller.id} className="pending-card">
              
              {/* Card content with shop info and action buttons */}
              <div className="card-content">
                {/* Shop details section with avatar and information */}
                <div className="shop-info">
                  <div className="shop-avatar">
                    <FaStore size={20} />
                  </div>
                  <div className="shop-details">
                    <h2 className="shop-name">{seller.shop}</h2>
                    <div className="meta-grid">
                      <span className="meta-item">
                        <FaUser size={12} /> <strong>Owner:</strong> {seller.name}
                      </span>
                      <span className="meta-item">
                        <FaEnvelope size={12} /> <strong>Email:</strong> {seller.email}
                      </span>
                      <span className="meta-item">
                        <FaPhone size={12} /> <strong>Phone:</strong> {seller.phone}
                      </span>
                      <span className="meta-item">
                        <FaMapMarkerAlt size={12} /> <strong>Address:</strong> {seller.address}
                      </span>
                      <span className="meta-item br-number">
                        BR No: {seller.br_no}
                      </span>
                      <span className="meta-item" style={{ color: '#C9A961', fontWeight: '600' }}>
                        Category: {seller.categories}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Approve and reject action buttons */}
                <div className="action-buttons">
                  <button 
                    className="approve-btn" 
                    onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                  >
                    <FaCheck /> Approve
                  </button>
                  
                  <button 
                    className="reject-btn" 
                    onClick={() => handleStatusUpdate(seller.id, 'REJECTED')}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingVendors;