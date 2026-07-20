// File path: code/frontend/src/components/assembler/AssemblerSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import './AssemblerSidebar.css'; // External CSS file for styling

const AssemblerSidebar = () => {
    const navigate = useNavigate();

    // Handle user logout
    // Uses localStorage.clear() to match the pattern used in
    // Admin/Vendor/Customer layouts across the app (consistency)
    const handleLogout = () => {
        // Ask for confirmation to prevent accidental logout
        if (window.confirm('Are you sure you want to logout?')) {
            // Clear all auth-related data (token, userRole, username, userId)
            localStorage.clear();

            // Redirect to login page
            navigate('/login');
        }
    };

    return (
        <div className="assembler-sidebar">

            {/* Sidebar Header */}
            <div className="sidebar-header">
                <h2>Giftora Assembler</h2>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav">

                {/* Dashboard Link */}
                <NavLink
                    to="/assembler"
                    end
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                {/* NOTE: Task Queue link removed temporarily.
                    Add it back once the /assembler/queue route
                    and its page component are created in App.js */}

            </nav>

            {/* Logout Section */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AssemblerSidebar;