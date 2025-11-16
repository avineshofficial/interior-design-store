import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './HeroSlider.css';

const HeroSlider = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const q = query(collection(db, 'promotions'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        const promoData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (promoData.length === 0) {
            console.warn("No promotions found in Firestore 'promotions' collection.");
        }
        
        setPromotions(promoData);
      } catch (error) {
        console.error("Error fetching promotions: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // --- THIS IS THE CONFIGURATION FOR THE SLIDER ---
  const settings = {
    dots: true,          // Show the dots at the bottom
    infinite: true,      // Loop the slider back to the start
    speed: 500,          // Transition speed in milliseconds
    slidesToShow: 1,     // Show one slide at a time
    slidesToScroll: 1,   // Scroll one slide at a time
    arrows: true,        // Show the next/previous arrows
    pauseOnHover: true,  // Pause the autoplay when the mouse is over the slider

    // --- THESE TWO LINES ENABLE THE AUTO-CHANGE FEATURE ---
    autoplay: true,        // THIS ENABLES AUTO-PLAY
    autoplaySpeed: 2000,   // THIS SETS THE DELAY to 4000ms (4 seconds) per slide
    // ----------------------------------------------------
  };

  if (loading) {
    return <div className="hero-slider-container loading-placeholder"></div>;
  }

  if (promotions.length === 0) {
      return null; // Don't render if there are no promotions
  }

  return (
    <div className="hero-slider-container">
      <Slider {...settings}>
        {promotions.map(promo => (
          <div key={promo.id}>
            <Link to={promo.link}>
              <img src={promo.imageUrl} alt={promo.title || 'Promotion'} className="slider-image" />
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;