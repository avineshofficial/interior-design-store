import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product || !product.id) {
    return null;
  }

  // --- FIX: Create a robust image URL variable ---
  // Use the first image if the 'images' array exists and has at least one item.
  // Otherwise, use a reliable placeholder URL.
  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://via.placeholder.com/300';
  // --- END OF FIX ---

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        {/* Use the new imageUrl variable here */}
        <img src={imageUrl} alt={product.title} className="product-image" />
      </Link>
      <div className="product-info">
        <h3 className="product-title">
            <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">₹{product.price ? product.price.toLocaleString() : 'N/A'}</p>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;