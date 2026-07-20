import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut, Settings, Package, UserCircle } from 'lucide-react';
import CartBadge from './CartBadge.jsx';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Customer';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchName() {
      if (!userId) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.name || (username.includes('@') ? username.split('@')[0] : username));
          setProfileImageUrl(data.profileImageUrl || null);
        } else {
          setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        }
      } catch (err) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
      }
    }
    fetchName();
  }, [userId, username]);


  // Handle logout logic
  const handleExit = () => {
    localStorage.clear();
    console.log("User logged out");
    navigate('/', { replace: true }); 
  };

  return (
    <header className="topbar-container">
      {/* Left — Logo & Brand */}
      <div className="topbar-brand" onClick={() => navigate('/customer/home')} style={{ cursor: 'pointer' }}>
        <div className="brand-text-wrapper">
          <span className="topbar-title">Giftora</span>
          <span className="topbar-tagline">Customer Portal</span>
        </div>
      </div>

      {/* Center — Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', marginRight: '32px' }}>
        {[
          { label: 'Build a Box',  route: '/customer/build-box' },
          { label: 'About Us',     route: '/customer/about-us' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="nav-link-btn" 
            style={{
              background: 'none',
              border: 'none',
              color: '#E8E8E8',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(201, 169, 97, 0.12)';
              e.target.style.color = '#C9A961';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'none';
              e.target.style.color = '#E8E8E8';
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right — Notifications, Profile & Exit */}
      <div className="topbar-actions">
        <CartBadge />
        
        <button className="notification-btn">
          <Bell className="notification-icon" size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="profile-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <div className="profile-section" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="profile-info">
              <span className="profile-name" style={{ textTransform: 'capitalize' }}>{displayName}</span>
              <span className="profile-role">Customer</span>
            </div>
            <div className="profile-avatar" style={profileImageUrl ? { padding: 0, overflow: 'hidden', background: 'transparent' } : {}}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <User size={18} />
              )}
            </div>
            <ChevronDown size={14} style={{ color: '#FFFFFF', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-arrow"></div>
              <ul className="dropdown-menu">
                <li onClick={() => { setIsDropdownOpen(false); navigate('/customer/profile'); }}>
                  <UserCircle size={16} />
                  <span>Profile</span>
                </li>
                <li onClick={() => { setIsDropdownOpen(false); navigate('/customer/orders'); }}>
                  <Package size={16} />
                  <span>Orders</span>
                </li>
                <li onClick={() => { setIsDropdownOpen(false); navigate('/customer/settings'); }}>
                  <Settings size={16} />
                  <span>Account Settings</span>
                </li>
                <div className="dropdown-divider"></div>
                <li onClick={handleExit} className="dropdown-signout">
                  <LogOut size={16} />
                  <span>Sign out</span>
                </li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;