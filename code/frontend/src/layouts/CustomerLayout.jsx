// CustomerLayout.jsx
// This is the wrapper layout for all logged-in customer pages.
// It works exactly like SellerLayout — it wraps the Header on top
// and the page content in the middle.
//
// Every customer page (GiftCustomizer, Orders, OrderDetail, Profile)
// will be wrapped by this layout automatically through the router.

import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';  // Outlet renders the current page
import Header from '../components/customer/Header';
import Footer from '../components/landingpage/Footer';

export default function CustomerLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Route Guard: Redirect to landing page if user is not authorized as a customer
  if (!userId || userRole !== 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header shown at top of every customer page */}
      <Header />

      {/* Outlet renders whichever customer page is active:
          /customize  → GiftCustomizer
          /orders     → Orders
          /orders/:id → OrderDetail
          /profile    → Profile */}
      <main style={{ flex: 1, paddingTop: '64px' }}>
        <Outlet />
      </main>

      {/* Footer shown at bottom of every customer page */}
      <Footer />

    </div>
  );
}