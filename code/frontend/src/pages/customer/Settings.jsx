// Settings.jsx
// Renders inside CustomerLayout via <Outlet />.
// All account editing lives here — Profile.jsx is view-only and links in via "Edit".

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Settings() {

  const location = useLocation();

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'info');

  const [infoForm,  setInfoForm]  = useState({ name: '', email: '', phone: '', profileImageUrl: '' });
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState('');

  const [passForm,  setPassForm]  = useState({ current: '', newPass: '', confirm: '' });
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState('');

  const [addrForm,  setAddrForm]  = useState({ line1: '', line2: '', city: '', district: '', province: '', postalCode: '' });
  const [addrSaved, setAddrSaved] = useState(false);
  const [addrError, setAddrError] = useState('');

  const navigate  = useNavigate();
  const userId    = localStorage.getItem('userId');
  const username  = localStorage.getItem('username');

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!userId || !username) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setInfoForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
            profileImageUrl: data.profileImageUrl || '',
          });
          setAddrForm({
            line1: data.addressLine1 || '',
            line2: data.addressLine2 || '',
            city: data.city || '',
            district: data.district || '',
            province: data.province || '',
            postalCode: data.postalCode || '',
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, username]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfoForm({ ...infoForm, profileImageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };


  async function handleSaveInfo() {
    if (!infoForm.name || !infoForm.email) {
      setInfoError('Please fill in name and email.');
      return;
    }
    setInfoError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          name: infoForm.name,
          email: infoForm.email,
          phoneNumber: infoForm.phone,
          profileImageUrl: infoForm.profileImageUrl
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}/password`, {
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${username}/address`, {
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
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}`, {
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

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="st-loading">
        <div className="st-spinner" />
        <p>Loading your settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="st-loading">
        <p>Please log in to view your settings.</p>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HEADER ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1"></div>
        <div className="ct-hero__orb ct-hero__orb--2"></div>
        <div className="ct-hero__inner">
          <button className="st-back-btn" onClick={() => navigate('/customer/profile')}>&larr; Back to Profile</button>
          <h1 className="ct-hero__title" style={{ marginTop: '16px' }}>Account Settings</h1>
          <p className="ct-hero__subtitle">Update your personal information, security, and addresses.</p>
        </div>
      </div>

      <div className="ct-body">
        {/* ── TABS ── */}
      <div className="st-tabs">
        {[
          { key: 'info',      label: 'Personal Info', icon: '👤' },
          { key: 'password',  label: 'Password',      icon: '🔒' },
          { key: 'addresses', label: 'Address',       icon: '📍' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`st-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="st-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="st-tab-content">

        {/* ─ Personal Info ─ */}
        {activeTab === 'info' && (
          <div className="st-card">
            <div className="st-card-header">
              <h3 className="st-card-title">Personal Information</h3>
              <p className="st-card-desc">Update your name, email, phone number and profile photo.</p>
            </div>

            <div className="st-form-row">
              <div className="st-form-group" style={{ flex: '1 1 100%', marginBottom: '16px' }}>
                <label className="st-label">Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {infoForm.profileImageUrl ? (
                    <img src={infoForm.profileImageUrl} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold, #C9A961)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16213E', fontSize: '24px', fontWeight: 'bold' }}>
                      {infoForm.name ? infoForm.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ color: '#E8E8E8', fontSize: '14px' }} />
                </div>
              </div>
            </div>

            <div className="st-form-row">
              <div className="st-form-group" style={{ flex: '1 1 100%' }}>
                <label className="st-label">Full Name</label>
                <input
                  className="st-input"
                  type="text"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="st-form-group">
              <label className="st-label">Email Address</label>
              <input
                className="st-input"
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="st-form-group">
              <label className="st-label">Phone Number</label>
              <input
                className="st-input"
                type="tel"
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                placeholder="077 000 0000"
              />
            </div>

            {infoError && <p className="st-error">{infoError}</p>}

            <button
              className={`st-btn-primary ${infoSaved ? 'saved' : ''}`}
              onClick={handleSaveInfo}
            >
              {infoSaved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ─ Change Password ─ */}
        {activeTab === 'password' && (
          <div className="st-card">
            <div className="st-card-header">
              <h3 className="st-card-title">Change Password</h3>
              <p className="st-card-desc">Choose a strong password with at least 6 characters.</p>
            </div>

            <div className="st-form-group">
              <label className="st-label">Current Password</label>
              <input
                className="st-input"
                type="password"
                value={passForm.current}
                onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div className="st-form-group">
              <label className="st-label">New Password</label>
              <input
                className="st-input"
                type="password"
                value={passForm.newPass}
                onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                placeholder="Enter new password"
              />
            </div>

            <div className="st-form-group">
              <label className="st-label">Confirm New Password</label>
              <input
                className="st-input"
                type="password"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            {passError && <p className="st-error">{passError}</p>}

            <button
              className={`st-btn-primary ${passSaved ? 'saved' : ''}`}
              onClick={handleChangePassword}
            >
              {passSaved ? '✓ Password Updated!' : 'Update Password'}
            </button>
          </div>
        )}

        {/* ─ Delivery Address ─ */}
        {activeTab === 'addresses' && (
          <div className="st-card">
            <div className="st-card-header">
              <h3 className="st-card-title">Delivery Address</h3>
              <p className="st-card-desc">Update your default delivery address.</p>
            </div>

            <div className="st-form-row">
              <div className="st-form-group">
                <label className="st-label">Street / Line 1</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.line1}
                  onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                  placeholder="42 Galle Road"
                />
              </div>
              <div className="st-form-group">
                <label className="st-label">Line 2 (Optional)</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.line2}
                  onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                  placeholder="Apartment, suite, etc."
                />
              </div>
            </div>

            <div className="st-form-row">
              <div className="st-form-group">
                <label className="st-label">City</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="Colombo 03"
                />
              </div>
              <div className="st-form-group">
                <label className="st-label">Province</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.province}
                  onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                  placeholder="Western Province"
                />
              </div>
            </div>

            <div className="st-form-row">
              <div className="st-form-group">
                <label className="st-label">District</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.district}
                  onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                  placeholder="Colombo"
                />
              </div>
              <div className="st-form-group">
                <label className="st-label">Postal Code</label>
                <input
                  className="st-input"
                  type="text"
                  value={addrForm.postalCode}
                  onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                  placeholder="00300"
                />
              </div>
            </div>

            {addrError && <p className="st-error">{addrError}</p>}

            <div className="st-form-row" style={{ marginTop: '8px' }}>
              <button className={`st-btn-primary ${addrSaved ? 'saved' : ''}`} onClick={handleSaveAddress}>
                {addrSaved ? '✓ Saved!' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

      </div>
      </div>
    </>
  );
}
