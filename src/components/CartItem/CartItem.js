import React from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi'; // Use a reliable icon library
import { useCart } from '../../context/CartContext';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleRemove = () => {
    removeFromCart(item.id);
  };
  
  const itemTotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      {/* Product info (image, title, price) */}
      <div className="cart-item-product">
        <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.title} />
        <div className="item-details">
          <Link to={`/products/${item.id}`} className="item-title">{item.title}</Link>
          <p className="item-price">₹{item.price.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Quantity Selector */}
      <div className="cart-item-quantity">
        <QuantitySelector
          quantity={item.quantity}
          onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
          onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
          maxQuantity={item.stock} // Pass the available stock
        />
      </div>

      {/* Item Total Price */}
      <div className="cart-item-total">
        ₹{itemTotal.toLocaleString()}
      </div>

      {/* Remove Button */}
      <div className="cart-item-remove">
        <button onClick={handleRemove} className="remove-btn">
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default CartItem;