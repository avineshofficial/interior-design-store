import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCart } from '../context/CartContext';
import BackButton from '../components/BackButton/BackButton';
import { useToast } from '../components/Toast/Toast';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- NEW: State to track the currently displayed large image ---
  const [selectedImage, setSelectedImage] = useState('');
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          
          // --- NEW: Set the first image from the array as the initial selected image ---
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          }

        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // You can add a more user-friendly notification here later
      alert(`${quantity} x ${product.title} added to your cart!`);
    }
  };
  
  // --- NEW: Function to change the main image when a thumbnail is clicked ---
  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  }

  if (loading) {
    return <div className="product-details-page loading">Loading...</div>;
  }

  if (error) {
    return <div className="product-details-page error">{error}</div>;
  }

  if (!product) {
    return null; // Should be handled by loading/error states
  }

  return (
    <div className="product-details-page">
      <BackButton />
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; {product.title}
      </div>
      <div className="product-details-content">
        <div className="product-gallery">
          {/* Main image now uses the 'selectedImage' state */}
          <div className="main-image-container">
            <img 
              src={selectedImage || 'https://via.placeholder.com/600'} 
              alt={product.title} 
              className="main-image" 
            />
          </div>

          {/* --- NEW: Map over ALL images to create the thumbnail grid --- */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-container">
              {product.images.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${selectedImage === imgUrl ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(imgUrl)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-info-details">
          <h1 className="product-main-title">{product.title}</h1>
          <p className="product-category-details">{product.category}</p>
          <p className="product-price-details">₹{product.price.toLocaleString()}</p>
          <div className="product-stock-status">
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>
          <div className="product-description-details">
            <p>{product.description}</p>
          </div>
          <div className="add-to-cart-action">
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              min="1"
              max={product.stock} // Prevent adding more than available stock
              className="quantity-selector"
            />
            <button onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;