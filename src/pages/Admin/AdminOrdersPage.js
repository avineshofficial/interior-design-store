import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import BackButton from '../../components/BackButton/BackButton';
import './AdminOrdersPage.css';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up a real-time listener for the 'orders' collection
    const ordersCollection = collection(db, 'orders');
    // Query to order documents by their creation time, newest first
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));

    // onSnapshot returns an unsubscribe function
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      }, 
      (err) => {
        console.error("Error listening to orders collection: ", err);
        setError("Failed to fetch orders. Please try refreshing the page.");
        setLoading(false);
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []); 

  const handleRowClick = (orderId) => { // <-- ADD THIS FUNCTION
    navigate(`/admin/orders/${orderId}`);
  };    

  if (loading) {
    return <div className="admin-page-container"><p>Loading orders...</p></div>;
  }

  if (error) {
    return <div className="admin-page-container error"><p>{error}</p></div>;
  }

  return (
    <div className="admin-orders-page">
      <BackButton to="/admin" />
      <h1 className="page-title">Customer Orders</h1>
      <p>Displaying {orders.length} most recent order(s). New orders will appear automatically.</p>

      <div className="orders-list-container">
        {orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={order.id} 
                  className={`status-${order.status?.toLowerCase()} clickable-row`} // <-- ADD clickable-row CLASS
                  onClick={() => handleRowClick(order.id)} // <-- ADD onClick HANDLER
                >
                  <td data-label="Order ID">#{order.id.substring(0, 6)}...</td>
                  <td data-label="Customer">{order.customer?.name}</td>
                  <td data-label="Phone">{order.customer?.phone}</td>
                  <td data-label="Total">₹{order.subtotal?.toLocaleString()}</td>
                  <td data-label="Status">
                    <span className="status-badge">{order.status}</span>
                  </td>
                  <td data-label="Date">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders have been placed yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;