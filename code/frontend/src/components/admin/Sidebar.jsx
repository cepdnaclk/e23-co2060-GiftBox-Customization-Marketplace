import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaThLarge, FaStore, FaCog, FaShoppingBag, FaUsersCog, FaGift } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/admin/staff-management" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaUsersCog size={18} /> 
          <span>Staff Management</span>
        </NavLink>

        <NavLink 
          to="/admin/vendors" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaStore size={18} /> 
          <span>Vendors</span>
        </NavLink>
        
        <NavLink 
          to="/admin/customers" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaShoppingBag size={18} /> 
          <span>Customers</span>
        </NavLink>

        <NavLink 
          to="/admin/categories" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Categories</span>
        </NavLink>

        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaCog size={18} /> 
          <span>Settings</span>
        </NavLink>

      </nav>
    </div>
  );
};

export default Sidebar;