import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Make sure `query` and `where` are imported
import { useSearchParams } from 'react-router-dom'; // <-- 1. Import useSearchParams
import { db } from '../services/firebase';
import ProductCard from '../components/ProductCard/ProductCard';
import './ProductsListPage.css';

const ProductsListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. GET URL PARAMETERS ---
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category'); // This will be "Steel", "photo", etc., or null

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Reset loading state on each fetch
      try {
        // --- 3. BUILD THE QUERY ---
        let productsQuery;
        const productsCollection = collection(db, "products");

        // If a category is specified in the URL, filter by it.
        if (categoryFilter) {
          productsQuery = query(productsCollection, where("category", "==", categoryFilter));
        } else {
          // Otherwise, fetch all products.
          productsQuery = query(productsCollection);
        }

        const querySnapshot = await getDocs(productsQuery);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);

      } catch (err) {
        console.error("Error fetching products: ", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]); // --- 4. RE-RUN EFFECT WHEN THE CATEGORY FILTER CHANGES ---


  if (loading) return <div className="loading-state">Loading products...</div>;
  if (error) return <div className="error-state">{error}</div>;
  
  return (
    <div className="products-page">
      {/* 5. Dynamically change the title based on the filter */}
      <h1 className="page-title">{categoryFilter ? categoryFilter : 'All Products'}</h1>
      
      {products.length === 0 ? (
        <div className="empty-state">No products found in this category.</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;