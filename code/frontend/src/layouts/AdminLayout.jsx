// Core library
import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Admin components
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';

// Stylesheet
import './AdminLayout.css';

// Admin layout wrapper component providing sidebar and top navigation
const AdminLayout = ({ children }) => {
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Route Guard: Redirect to login if user is not authorized as an admin
  if (!userId || userRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Top navigation bar */}
      <TopBar />

      <div className="layout-wrapper">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content area */}
        <main className="main-content" ref={mainContentRef}>
          {children}
        </main>

      </div>
      
    </div>
  );
};

export default AdminLayout;