import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton/BackButton';
import './UserOrdersPage.css'; // Reusing the same CSS

const OrderHistoryPage = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const ordersQuery = query(
            collection(db, 'orders'), 
            where('customerUid', '==', currentUser.uid),
            where('status', 'in', ['Delivered', 'Cancelled']),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching order history:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);
    
    const handleBuyAgain = (orderId) => alert(`Functionality to "Buy Again" for order ${orderId} is not yet implemented.`);
    const handleLeaveReview = (orderId) => alert(`Functionality to "Leave a Review" for order ${orderId} is not yet implemented.`);

    if (loading) return <div className="user-orders-page"><p className="status-message">Loading order history...</p></div>;
    
    return (
        <div className="user-orders-page">
            <BackButton />
            <h1 className="page-title">Order History</h1>
            <div className="orders-container">
                {orders.length === 0
                    ? (
                        <div className="no-orders-message">
                            <p>You have no completed or cancelled orders.</p>
                            <button onClick={() => navigate('/products')} className="shop-now-btn">Shop Now</button>
                        </div>
                    )
                    : orders.map(order => (
                        <div key={order.id} className="order-card-history">
                            <div className="order-card-header">
                                <div>
                                    <p>ORDER PLACED</p>
                                    <span>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <p>TOTAL</p>
                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div>
                                    <p>ORDER ID</p>
                                    <span>#{order.id}</span>
                                </div>
                            </div>
                            <div className="order-card-body">
                                <p className="order-status"><strong>Status:</strong> {order.status}</p>
                                {order.items.map(item => (
                                    <div key={item.id} className="order-item-history">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.title}/>
                                        <p>{item.title}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="order-card-actions">
                                <button onClick={() => handleBuyAgain(order.id)}>Buy Again</button>
                                <button onClick={() => handleLeaveReview(order.id)}>Leave a Review</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default OrderHistoryPage;