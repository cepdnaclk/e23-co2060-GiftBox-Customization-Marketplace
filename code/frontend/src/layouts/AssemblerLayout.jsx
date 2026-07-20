// File path: code/frontend/src/layouts/AssemblerLayout.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import AssemblerSidebar from '../components/assembler/AssemblerSidebar';
import './AssemblerLayout.css';

// Uses the "children" prop pattern to match AdminLayout / VendorLayout
const AssemblerLayout = ({ children }) => {
    // Route Guard: check auth state from localStorage
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    // Redirect to login if user is not authorized as an assembler
    if (!userId || userRole !== 'ASSEMBLER') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="assembler-layout-container">

            {/* Sidebar on the left */}
            <AssemblerSidebar />

            {/* Main content wrapper */}
            <div className="assembler-main-content">
                <main className="assembler-main-area">
                    {/* Child routes/pages are rendered here via children prop */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AssemblerLayout;