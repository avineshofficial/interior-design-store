import React from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import './QuantitySelector.css';

const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxQuantity }) => {
  return (
    <div className="quantity-selector-wrapper">
      <button 
        type="button" 
        className="quantity-btn" 
        onClick={onDecrease}
        disabled={quantity <= 1} // Disable if quantity is 1
      >
        <FiMinus />
      </button>
      <span className="quantity-display">{quantity}</span>
      <button 
        type="button" 
        className="quantity-btn" 
        onClick={onIncrease}
        disabled={quantity >= maxQuantity} // Disable if quantity is at max stock
      >
        <FiPlus />
      </button>
    </div>
  );
};

export default QuantitySelector;