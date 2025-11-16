import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton/BackButton';
import './UserOrdersPage.css'; // We will replace the styles in the next step

const UserOrdersPage = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add an error state for better feedback
    const navigate = useNavigate();

    useEffect(() => {
        // Don't proceed if the user is not logged in yet.
        if (!currentUser) {
            setLoading(false); // Stop loading, the message will show "Please log in"
            return;
        }

        setError(null);
        setLoading(true);
        
        // Define the query to get this user's orders, newest first.
        const ordersQuery = query(
            collection(db, 'orders'), 
            where('customerUid', '==', currentUser.uid), 
            orderBy('createdAt', 'desc')
        );

        // Set up a real-time listener to get live updates.
        const unsubscribe = onSnapshot(ordersQuery, 
            (snapshot) => {
                const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(userOrders);
                setLoading(false);
            }, 
            (err) => {
                // If there's an error (like a permission issue), log it and show a message.
                console.error("Firebase Snapshot Error:", err);
                setError("Failed to fetch your orders. Please check your connection or try again later.");
                setLoading(false);
            }
        );

        // This function will run when the component unmounts to prevent memory leaks.
        return () => unsubscribe(); 

    }, [currentUser]); // Re-run this effect if the user logs in or out.


    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const renderContent = () => {
        if (loading) {
            return <p className="status-message">Loading your orders...</p>;
        }
        if (error) {
            return <p className="status-message error">{error}</p>;
        }
        if (!currentUser) {
            return <p className="no-orders-message">Please log in to see your orders.</p>;
        }
        if (orders.length === 0) {
            return (
                <div className="no-orders-message">
                    <p>You have not placed any orders yet.</p>
                    <button onClick={() => navigate('/products')} className="shop-now-btn">Shop Now</button>
                </div>
            );
        }
        return (
            <table className="orders-table-user">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="clickable-row" onClick={() => handleOrderClick(order.id)}>
                            <td data-label="Order ID">#{order.id}</td>
                            <td data-label="Date">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                            <td data-label="Total">₹{order.subtotal.toLocaleString()}</td>
                            <td data-label="Status">
                                <span className={`status-badge-user status-${order.status?.toLowerCase()}`}>{order.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="user-orders-page">
            <BackButton />
            <h1 className="page-title">My Orders</h1>
            <div className="orders-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default UserOrdersPage;