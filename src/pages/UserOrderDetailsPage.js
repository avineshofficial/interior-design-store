import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, collection, query, orderBy, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore'; // Import onSnapshot, writeBatch
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import OrderStatusTracker from '../components/OrderStatusTracker/OrderStatusTracker';
import BackButton from '../components/BackButton/BackButton';
import './UserOrderDetailsPage.css';

const UserOrderDetailsPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !orderId) {
      setError("Invalid request.");
      setLoading(false);
      return;
    }

    // Set up a real-time listener for the main order document
    const orderDocRef = doc(db, 'orders', orderId);
    const unsubscribeOrder = onSnapshot(orderDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().customerUid === currentUser.uid) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Order not found or you're not authorized to view it.");
        setLoading(false); // Stop loading if order not found
      }
    }, (err) => {
      console.error("Error listening to order doc:", err);
      setError("There was a problem retrieving your order details.");
      setLoading(false);
    });

    // Set up a real-time listener for the status history
    const historyRef = collection(db, 'orders', orderId, 'statusHistory');
    const q = query(historyRef, orderBy('timestamp', 'asc'));
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => doc.data());
      setHistory(historyData);
      setLoading(false); // Mark loading as complete once history is fetched
    }, (err) => {
      console.error("Error listening to order history:", err);
      // Don't set a hard error here, the order might just not have a history yet.
      // If rules are correct, an empty array is a valid result.
      setLoading(false);
    });

    // Cleanup function to detach listeners when the component unmounts
    return () => {
      unsubscribeOrder();
      unsubscribeHistory();
    };
  }, [orderId, currentUser]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
        const batch = writeBatch(db);
        const orderRef = doc(db, 'orders', orderId);
        
        // Update the status on the main order
        batch.update(orderRef, { status: "Cancelled" });
        
        // Add a new document to the history subcollection
        const historyRef = doc(collection(orderRef, 'statusHistory'));
        batch.set(historyRef, { status: "Cancelled", timestamp: serverTimestamp() });

        await batch.commit();
        // The real-time listener will automatically update the UI
        alert("Your order has been cancelled.");
    } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order.");
    }
  };

  if (loading) return <div className="user-order-details-page loading"><p>Loading order details...</p></div>;
  if (error) return <div className="user-order-details-page error"><p>{error}</p></div>;
  if (!order) return <div className="user-order-details-page error"><p>Could not load order.</p></div>;

  const canCancel = order.status === 'Pending' || order.status === 'Processing';

  return (
    <div className="user-order-details-page">
      <BackButton to="/orders">Back to My Orders</BackButton>
      <h1 className="page-title">Order Details</h1>
      
      {/* Conditionally render the tracker only if there is history */}
      {history.length > 0 && (
          <OrderStatusTracker history={history} currentStatus={order.status} />
      )}
      
      <div className="order-details-grid">
          <div className="order-info-card">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Date:</strong> {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
              <p><strong>Total:</strong> <span className="total-price">₹{order.subtotal.toLocaleString()}</span></p>
              <p><strong>Status:</strong> <span className={`status-badge-user status-${order.status?.toLowerCase()}`}>{order.status}</span></p>
              {canCancel && (
                  <div className="cancel-order-section">
                      <button onClick={handleCancelOrder} className="cancel-order-btn">Cancel Order</button>
                  </div>
              )}
          </div>
        <div className="order-info-card">
          <h3>Shipping Address</h3>
          <address>
            <strong>{order.customer.name}</strong><br/>
            {order.shippingAddress.line1}<br/>
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br/>
            {order.customer.phone}
          </address>
        </div>
      </div>

      <div className="order-items-card">
        <h3>Items in this Order</h3>
        {order.items.map(item => (
          <div className="ordered-item" key={item.productId}>
            <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.title} />
            <div className="item-info">
              <Link to={`/products/${item.productId}`} className="item-title-link">{item.title}</Link>
              <span>{item.quantity} x ₹{item.price.toLocaleString()}</span>
            </div>
            <div className="item-total">
              ₹{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrderDetailsPage;