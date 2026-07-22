import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App.js'; // The root component that contains Sidebar and Routes

/**
 * Root Initialization
 * This file finds the <div id="root"> inside index.html 
 * and injects the React application into it.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  /**
   * React.StrictMode is a wrapper that helps during development:
   * 1. It identifies components with unsafe lifecycles.
   * 2. It warns about legacy API usage.
   * 3. It double-invokes renders to help find side-effect bugs.
   */
  <React.StrictMode>
    <App />
  </React.StrictMode>
);