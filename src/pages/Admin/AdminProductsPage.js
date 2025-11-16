import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import BackButton from '../../components/BackButton/BackButton';
import './AdminProductsPage.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
      // Update state to remove the product from the UI
      setProducts(products.filter(p => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  if (loading) {
    return <div className="admin-page"><p>Loading products...</p></div>;
  }

  return (
    <div className="admin-products-page">
      <BackButton to="/admin" />
      <div className="page-header">
        <h1 className="page-title">Manage Products</h1>
        <Link to="/admin/products/new" className="add-new-btn">
          + Add New Product
        </Link>
      </div>
      
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map(product => (
              <tr key={product.id}>
                <td data-label="Image">
                  <img src={product.images?.[0] || 'https://via.placeholder.com/60'} alt={product.title} className="product-thumbnail" />
                </td>
                <td data-label="Title">{product.title}</td>
                <td data-label="Category">{product.category}</td>
                <td data-label="Price">₹{product.price?.toLocaleString()}</td>
                <td data-label="Stock">{product.stock}</td>
                <td data-label="Actions" className="actions-cell">
                  <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit-btn">Edit</Link>
                  {/* --- THIS IS THE BUTTON THAT NEEDS TO BE ADDED --- */}
                  <button onClick={() => handleDelete(product.id)} className="action-btn edit-btn" id="delbtn">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="no-items-cell">No products found. Add one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;