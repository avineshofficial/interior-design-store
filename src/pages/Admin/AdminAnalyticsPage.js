import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import BackButton from '../../components/BackButton/BackButton';
import './AdminAnalyticsPage.css'; // We'll create this next

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all orders to calculate revenue and count
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let revenue = 0;
        ordersSnapshot.forEach(doc => {
          revenue += doc.data().subtotal;
        });
        setStats(prev => ({
          ...prev,
          totalRevenue: revenue,
          totalOrders: ordersSnapshot.size,
        }));

        // Fetch users for total user count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setStats(prev => ({ ...prev, totalUsers: usersSnapshot.size }));

        // Fetch products for total product count
        const productsSnapshot = await getDocs(collection(db, 'products'));
        setStats(prev => ({ ...prev, totalProducts: productsSnapshot.size }));

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-page"><p>Loading analytics...</p></div>;
  }

  return (
    <div className="admin-analytics-page">
      <BackButton to="/admin" />
      <h1 className="page-title">Analytics Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Revenue</h4>
          <p>₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h4>Total Products</h4>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;