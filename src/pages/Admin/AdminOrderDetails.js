import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import BackButton from '../../components/BackButton/BackButton';
import './AdminOrderDetails.css';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          setOrder(orderData);
          setStatus(orderData.status);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    // Prevent updating to the same status
    if (order.status === status) return;

    if (!window.confirm(`Are you sure you want to change the status to "${status}"?`)) return;

    setIsUpdating(true);
    try {
      // 1. Update the main order document's status
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: status });

      // --- 2. ADD A NEW DOCUMENT to the statusHistory subcollection ---
      const historyRef = collection(db, 'orders', id, 'statusHistory');
      await addDoc(historyRef, {
        status: status,
        timestamp: serverTimestamp()
      });

      setOrder(prev => ({ ...prev, status: status })); // Update local state
      alert("Order status updated successfully!");

    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="admin-order-details-page"><p>Loading order details...</p></div>;
  if (!order) return <div className="admin-order-details-page"><p>Order not found.</p></div>;

  return (
    <div className="admin-order-details-page">
      <div className="page-header">
        <BackButton to="/admin/orders">Back to Orders</BackButton>
        <h1 className="page-title">Order Details</h1>
        
      </div>

      <div className="details-grid">
        <div className="order-summary-card card">
            <h3>Order #{order.id}</h3>
            <p><strong>Date:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹{order.subtotal.toLocaleString()}</p>
            <div className="status-update-section">
                <label htmlFor="status">Update Status:</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button onClick={handleStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
            </div>
        </div>

        <div className="customer-details-card card">
            <h3>Customer & Shipping</h3>
            <p><strong>Name:</strong> {order.customer.name}</p>
            <p><strong>Phone:</strong> {order.customer.phone}</p>
            <p><strong>Email:</strong> {order.customer.email || 'N/A'}</p>
            <address>
                {order.shippingAddress.line1}<br/>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </address>
             {order.notes && <p className="order-notes"><strong>Notes:</strong> {order.notes}</p>}
        </div>
      </div>
      
      <div className="order-items-card card">
        <h3>Items Ordered</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.productId}>
                {/* --- THIS IS THE FIX --- */}
                <td data-label="Product">{item.title}</td>
                <td data-label="Quantity">{item.quantity}</td>
                <td data-label="Price">₹{item.price.toLocaleString()}</td>
                <td data-label="Total">₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderDetails;