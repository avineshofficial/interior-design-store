import React, { useState, useEffect } from 'react'; // Import hooks
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import firestore functions
import { db } from '../services/firebase'; // Import db instance
import HeroSlider from '../components/HeroSlider/HeroSlider';
import './HomePage.css';
import heroImage from '../assets/images/placeholder.jpg'; // Or your hero image

const HomePage = () => {
  // State to hold the dynamic categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('name')); // Add ordering for consistency
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  return (
    <div className="home-page">
      {/* 2. REMOVE the old hero-section and REPLACE it with HeroSlider */}
      <HeroSlider />

      <section className="featured-categories">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {loading ? <p>Loading categories...</p> : (
            categories.map(category => (
              <Link 
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
                style={{ backgroundImage: `url(${category.imageUrl})` }}
              >
                <h3>{category.name}</h3>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;