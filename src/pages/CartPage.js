import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem/CartItem';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, subtotal, clearCart, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Navigate to the checkout page
    navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="cart-page empty-cart">
        <h1 className="page-title">Your Shopping Cart</h1>
        <p>Your cart is currently empty.</p>
        <Link to="/products" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-list">
          <div className="cart-header">
            <h4>Product</h4>
            <h4>Quantity</h4>
            <h4>Total</h4>
            <h4></h4>
          </div>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Cart Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          {/* You could add shipping/taxes here if needed */}
          <div className="summary-total">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;