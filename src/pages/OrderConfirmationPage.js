import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const { orderId } = useParams(); // Get orderId from the URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the specific order document from Firestore
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("No order ID provided.");
        return;
      }

      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDocSnap = await getDoc(orderDocRef);

        if (orderDocSnap.exists()) {
          setOrder({ id: orderDocSnap.id, ...orderDocSnap.data() });
        } else {
          setError("Order not found. Please check your order ID.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("There was a problem retrieving your order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]); // Re-run effect if orderId changes

  if (loading) {
    return <div className="confirmation-page-container"><p>Loading your order details...</p></div>;
  }

  if (error) {
    return <div className="confirmation-page-container error"><p>{error}</p></div>;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="success-icon">&#10004;</div>
        <h1>Thank You For Your Order!</h1>
        <p className="confirmation-message">
          Your order has been placed successfully. A confirmation has been sent to the admin via WhatsApp.
        </p>

        {order && (
          <div className="order-summary-box">
            <h3>Order Summary</h3>
            <p className="order-id">
              <strong>Order ID:</strong> #{order.id}
            </p>
            
            <div className="order-details-section">
                <h4>Items Ordered:</h4>
                <ul className="ordered-items-list">
                    {order.items.map((item) => (
                    <li key={item.productId}>
                        <span>{item.quantity} x {item.title}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                    ))}
                </ul>
                <div className="order-total">
                    <strong>Total:</strong>
                    <strong>₹{order.subtotal.toLocaleString()}</strong>
                </div>
            </div>

            <div className="order-details-section">
                <h4>Shipping to:</h4>
                <p>{order.customer.name}</p>
                <p>{order.shippingAddress.line1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
        )}

        <Link to="/" className="home-button">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;