// Profile.jsx
// Renders inside CustomerLayout via <Outlet />.
// No full-page reload — React Router handles navigation.

import React, { useState, useEffect } from 'react';
import './Profile.css';

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Profile() {

  const [profile,      setProfile]      = useState(null);
  const [address,      setAddress]      = useState(null);
  const [stats,        setStats]        = useState({
    totalOrders: 0,
    delivered:   0,
    inProgress:  0,
    totalSpent:  0
  });
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('info');

  const [infoForm,     setInfoForm]     = useState({ name:'', email:'', phone:'' });
  const [infoSaved,    setInfoSaved]    = useState(false);
  const [infoError,    setInfoError]    = useState('');

  const [passForm,     setPassForm]     = useState({ current:'', newPass:'', confirm:'' });
  const [passSaved,    setPassSaved]    = useState(false);
  const [passError,    setPassError]    = useState('');

  const [addrForm,     setAddrForm]     = useState({ line1:'', line2:'', city:'', district:'', province:'', postalCode:'' });
  const [addrSaved,    setAddrSaved]    = useState(false);
  const [addrError,    setAddrError]    = useState('');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!userId || !username) {
        setLoading(false);
        return;
      }
      try {
        // Fetch profile
        const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setInfoForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
          });
          
          setAddrForm({
            line1: data.addressLine1 || '',
            line2: data.addressLine2 || '',
            city: data.city || '',
            district: data.district || '',
            province: data.province || '',
            postalCode: data.postalCode || '',
          });
          setAddress(data);
        }

        // Fetch stats (mocked for now until backend orders endpoint is ready)
        // If there's a backend endpoint for orders, you can sum it up here
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, username]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleSaveInfo() {
    if (!infoForm.name || !infoForm.email) {
      setInfoError('Please fill in name and email.');
      return;
    }
    setInfoError('');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          name: infoForm.name,
          email: infoForm.email,
          phoneNumber: infoForm.phone
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setInfoSaved(true);
        setTimeout(() => setInfoSaved(false), 2000);
      } else {
        setInfoError('Failed to update profile.');
      }
    } catch (err) {
      setInfoError('Network error while saving profile.');
    }
  }

  async function handleChangePassword() {
    if (!passForm.current || !passForm.newPass || !passForm.confirm) {
      setPassError('Please fill in all fields.');
      return;
    }
    if (passForm.newPass !== passForm.confirm) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passForm.newPass.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }
    setPassError('');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.newPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassSaved(true);
        setPassForm({ current: '', newPass: '', confirm: '' });
        setTimeout(() => setPassSaved(false), 2000);
      } else {
        setPassError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Network error while changing password.');
    }
  }

  async function handleSaveAddress() {
    if (!addrForm.line1 || !addrForm.city || !addrForm.province) {
      setAddrError('Please fill in Address Line 1, City, and Province.');
      return;
    }
    setAddrError('');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${username}/address`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          addressLine1: addrForm.line1,
          addressLine2: addrForm.line2,
          city: addrForm.city,
          district: addrForm.district,
          province: addrForm.province,
          postalCode: addrForm.postalCode,
          phoneNumber: infoForm.phone // Assuming same phone
        }),
      });
      
      if (res.ok) {
        // Also update the main customer record just in case
        await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              addressLine1: addrForm.line1,
              addressLine2: addrForm.line2,
              city: addrForm.city,
              district: addrForm.district,
              province: addrForm.province,
              postalCode: addrForm.postalCode,
            }),
        });
        setAddrSaved(true);
        setTimeout(() => setAddrSaved(false), 2000);
      } else {
          setAddrError('Failed to save address.');
      }
    } catch (err) {
        setAddrError('Network error while saving address.');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pf-loading">
        <div className="pf-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  if (!profile) {
      return (
        <div className="pf-loading">
            <p>Please log in to view your profile.</p>
        </div>
      );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="pf-page">

      {/* ── HERO HEADER ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1" />
        <div className="ct-hero__orb ct-hero__orb--2" />
        <div className="ct-hero__inner">
          <div className="ct-hero__label">My Profile</div>
          <h1 className="ct-hero__title">{profile.name || 'My Account'}</h1>
          <p className="ct-hero__sub">{profile.email} &nbsp;&middot;&nbsp; Member since {formatDate(profile.createdAt)}</p>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="pf-stats-row">
        <div className="pf-stat-box">
          <span className="pf-stat-num">{stats.totalOrders}</span>
          <span className="pf-stat-label">Total Orders</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num green">{stats.delivered}</span>
          <span className="pf-stat-label">Delivered</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num blue">{stats.inProgress}</span>
          <span className="pf-stat-label">In Progress</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num gold">Rs {stats.totalSpent.toLocaleString()}</span>
          <span className="pf-stat-label">Total Spent</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pf-tabs">
        {[
          { key: 'info',      label: 'Personal Info',     icon: '👤' },
          { key: 'password',  label: 'Password',          icon: '🔒' },
          { key: 'addresses', label: 'Address',           icon: '📍' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pf-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="pf-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="pf-tab-content">

        {/* ─ Personal Info ─ */}
        {activeTab === 'info' && (
          <div className="pf-card">
            <div className="pf-card-header">
              <h3 className="pf-card-title">Personal Information</h3>
              <p className="pf-card-desc">Update your name, email and phone number.</p>
            </div>

            <div className="pf-form-row">
              <div className="pf-form-group" style={{ flex: '1 1 100%' }}>
                <label className="pf-label">Full Name</label>
                <input
                  className="pf-input"
                  type="text"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="pf-form-group">
              <label className="pf-label">Email Address</label>
              <input
                className="pf-input"
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="pf-form-group">
              <label className="pf-label">Phone Number</label>
              <input
                className="pf-input"
                type="tel"
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                placeholder="077 000 0000"
              />
            </div>

            {infoError && <p className="pf-error">{infoError}</p>}

            <button
              className={`pf-btn-primary ${infoSaved ? 'saved' : ''}`}
              onClick={handleSaveInfo}
            >
              {infoSaved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ─ Change Password ─ */}
        {activeTab === 'password' && (
          <div className="pf-card">
            <div className="pf-card-header">
              <h3 className="pf-card-title">Change Password</h3>
              <p className="pf-card-desc">Choose a strong password with at least 6 characters.</p>
            </div>

            <div className="pf-form-group">
              <label className="pf-label">Current Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.current}
                onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div className="pf-form-group">
              <label className="pf-label">New Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.newPass}
                onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                placeholder="Enter new password"
              />
            </div>

            <div className="pf-form-group">
              <label className="pf-label">Confirm New Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            {passError && <p className="pf-error">{passError}</p>}

            <button
              className={`pf-btn-primary ${passSaved ? 'saved' : ''}`}
              onClick={handleChangePassword}
            >
              {passSaved ? '✓ Password Updated!' : 'Update Password'}
            </button>
          </div>
        )}

        {/* ─ Delivery Addresses ─ */}
        {activeTab === 'addresses' && (
            <div className="pf-card">
                <div className="pf-card-header">
                  <h3 className="pf-card-title">Delivery Address</h3>
                  <p className="pf-card-desc">Update your default delivery address.</p>
                </div>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label className="pf-label">Street / Line 1</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.line1}
                      onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                      placeholder="42 Galle Road"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-label">Line 2 (Optional)</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.line2}
                      onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                </div>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label className="pf-label">City</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.city}
                      onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      placeholder="Colombo 03"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-label">Province</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.province}
                      onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                      placeholder="Western Province"
                    />
                  </div>
                </div>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label className="pf-label">District</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.district}
                      onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                      placeholder="Colombo"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-label">Postal Code</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={addrForm.postalCode}
                      onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                      placeholder="00300"
                    />
                  </div>
                </div>

                {addrError && <p className="pf-error">{addrError}</p>}

                <div className="pf-form-row" style={{ marginTop: '8px' }}>
                  <button className={`pf-btn-primary ${addrSaved ? 'saved' : ''}`} onClick={handleSaveAddress}>
                    {addrSaved ? '✓ Saved!' : 'Save Address'}
                  </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}