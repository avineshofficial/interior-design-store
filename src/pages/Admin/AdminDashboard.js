import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="welcome-message">
        Welcome back, {currentUser?.displayName}! This is the admin panel for <strong>Saraswati Star Interior Design</strong>.
      </p>

      <div className="admin-nav-grid">
        <Link to="/admin/orders" className="admin-nav-card">
          <div className="nav-card-icon">📦</div>
          <h3>Manage Orders</h3>
          <p>View, track, and update customer orders.</p>
        </Link>

        <Link to="/admin/products" className="admin-nav-card">
          <div className="nav-card-icon">🛋️</div>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove products from your catalog.</p>
        </Link>

        <Link to="/admin/categories" className="admin-nav-card">
          <div className="nav-card-icon">📚</div>
          <h3>Manage Categories</h3>
          <p>Organize products into different collections.</p>
        </Link>

        {/* --- NEW CARD --- */}
        <Link to="/admin/users" className="admin-nav-card">
           <div className="nav-card-icon">👥</div>
           <h3>Manage Users</h3>
           <p>View all registered customer accounts.</p>
        </Link>
        
        {/* --- ENABLED CARD --- */}
        <Link to="/admin/analytics" className="admin-nav-card">
           <div className="nav-card-icon">📈</div>
           <h3>Analytics</h3>
           <p>View sales reports and website statistics.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;