// Profile.jsx
// Renders inside CustomerLayout via <Outlet />.
// View-only profile summary. All editing happens on the /settings page.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Profile() {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    delivered:   0,
    inProgress:  0,
    totalSpent:  0
  });

  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  // Navigate to Settings and pre-select a tab there
  function goToSettings(tab) {
    navigate('/customer/settings', { state: { tab } });
  }

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
        }

        // Fetch order stats (mocked for now until backend orders endpoint is ready)
        try {
          const statsRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/customer/${userId}/summary`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (statsRes.ok) {
            const s = await statsRes.json();
            setStats({
              totalOrders: s.totalOrders || 0,
              delivered:   s.delivered || 0,
              inProgress:  s.inProgress || 0,
              totalSpent:  s.totalSpent || 0,
            });
          }
        } catch {
          // Orders summary endpoint not available yet — keep defaults
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, username]);

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

  // Build a short "location" string from whatever address fields exist
  const locationText = [profile.city, profile.district, profile.province]
    .filter(Boolean)
    .join(', ') || 'Sri Lanka';

  const initials = (profile.name || username || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HERO BANNER ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1"></div>
        <div className="ct-hero__orb ct-hero__orb--2"></div>
        <div className="ct-hero__inner">
          <div className="ct-hero__label">YOUR ACCOUNT</div>
          <h1 className="ct-hero__title">Welcome, {profile.name}</h1>
          <p className="ct-hero__subtitle">Manage your profile, view orders, and customize your settings.</p>
        </div>
      </div>

      <div className="ct-body">
        {/* ── PROFILE SUMMARY CARD ── */}
        <div className="pf-summary-card">
          <div className="pf-summary-left">
            {profile.profileImageUrl ? (
              <div className="pf-summary-avatar" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
                <img src={profile.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
            ) : (
              <div className="pf-summary-avatar">{initials}</div>
            )}
            <div className="pf-summary-info">
              <h1 className="pf-summary-name">{profile.name || 'My Account'}</h1>
              <p className="pf-summary-handle">@{username || 'user'}</p>
              <div className="pf-summary-meta-row">
                <span className="pf-summary-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {locationText}
                </span>
                <span className="pf-summary-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Joined in {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <button className="pf-summary-edit" onClick={() => goToSettings('info')}>Edit</button>
        </div>

        {/* ── DETAIL CARDS ── */}
        <div className="pf-details-grid">

          {/* Contact Information */}
          <div className="pf-detail-card">
            <div className="pf-detail-card-head">
              <h3 className="pf-detail-card-title">Contact Information</h3>
              <button className="pf-detail-manage" onClick={() => goToSettings('info')}>Manage</button>
            </div>
            <div className="pf-detail-row">
              <svg className="pf-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <div>
                <span className="pf-detail-label">Email</span>
                <span className="pf-detail-value">{profile.email || '—'}</span>
              </div>
            </div>
            <div className="pf-detail-row">
              <svg className="pf-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <span className="pf-detail-label">Phone</span>
                <span className="pf-detail-value">{profile.phoneNumber || '—'}</span>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="pf-detail-card">
            <div className="pf-detail-card-head">
              <h3 className="pf-detail-card-title">Address Details</h3>
              <button className="pf-detail-manage" onClick={() => goToSettings('addresses')}>Manage</button>
            </div>
            {profile.addressLine1 ? (
              <>
                <p className="pf-address-text">
                  {profile.addressLine1}
                  {profile.addressLine2 ? `, ${profile.addressLine2}` : ''}
                </p>
                <p className="pf-address-text muted">
                  {[profile.city, profile.district, profile.province].filter(Boolean).join(', ')}
                  {profile.postalCode ? ` ${profile.postalCode}` : ''}
                </p>
              </>
            ) : (
              <p className="pf-detail-empty">No delivery address saved yet.</p>
            )}
          </div>

          {/* Order Overview */}
          <div className="pf-detail-card">
            <div className="pf-detail-card-head">
              <h3 className="pf-detail-card-title">Order Overview</h3>
              <button className="pf-detail-manage" onClick={() => navigate('/customer/orders')}>View All</button>
            </div>
            <div className="pf-mini-stats-grid">
              <div className="pf-mini-stat">
                <span className="pf-mini-stat-num">{stats.totalOrders}</span>
                <span className="pf-mini-stat-label">Total Orders</span>
              </div>
              <div className="pf-mini-stat">
                <span className="pf-mini-stat-num green">{stats.delivered}</span>
                <span className="pf-mini-stat-label">Delivered</span>
              </div>
              <div className="pf-mini-stat">
                <span className="pf-mini-stat-num blue">{stats.inProgress}</span>
                <span className="pf-mini-stat-label">In Progress</span>
              </div>
              <div className="pf-mini-stat">
                <span className="pf-mini-stat-num gold">Rs {stats.totalSpent.toLocaleString()}</span>
                <span className="pf-mini-stat-label">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Account Activity / Security */}
          <div className="pf-detail-card">
            <div className="pf-detail-card-head">
              <h3 className="pf-detail-card-title">Account Activity</h3>
              <button className="pf-detail-manage" onClick={() => goToSettings('password')}>Security</button>
            </div>
            <div className="pf-detail-row">
              <svg className="pf-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <div>
                <span className="pf-detail-label">Member Since</span>
                <span className="pf-detail-value">{formatDate(profile.createdAt)}</span>
              </div>
            </div>
            <div className="pf-detail-row">
              <svg className="pf-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <span className="pf-detail-label">Account Status</span>
                <span className="pf-detail-value pf-status-active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
