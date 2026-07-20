import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import './TopBar.css';
import logo from '../../assets/logo.png';

const TopBar = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    async function fetchName() {
      if (!userId) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.name || (username.includes('@') ? username.split('@')[0] : username));
        } else {
          setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        }
      } catch (err) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
      }
    }
    fetchName();
  }, [userId, username]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <header className="topbar-container">

      {/* Left Section - Logo/Brand */}
      <div className="topbar-brand">
        <img src={logo} alt="Giftora Logo" className="topbar-logo" />
        <div className="brand-text-wrapper">
          <span className="topbar-title">Giftora</span>
          <span className="topbar-tagline">Admin Panel</span>
        </div>
      </div>

      {/* Right Section: Notifications, Profile & Logout */}
      <div className="topbar-actions">
        
        {/* Notification Button */}
        <button className="notification-btn">
          <Bell className="notification-icon" />
          <span className="notification-badge"></span>
        </button>
        
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-info">
            <span className="profile-name" style={{ textTransform: 'capitalize' }}>{displayName}</span>
            <span className="profile-role">Administrator</span>
          </div>
          <div className="profile-avatar">
            <User size={18} />
          </div>
        </div>

        {/* Logout Button */}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(231, 76, 60, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#E74C3C',
            marginLeft: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'}
        >
          <LogOut size={20} />
        </button>
        
      </div>

    </header>
  );
};

export default TopBar;