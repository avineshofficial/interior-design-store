import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = () => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo-icon">
        {/* This is the SVG code for the new Lotus-Star Logo */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Four outer lotus petals */}
          <path d="M50 0 L35 45 C 40 50, 60 50, 65 45 Z" fill="currentColor" opacity="0.7" />
          <path d="M100 50 L55 65 C 50 60, 50 40, 55 35 Z" fill="currentColor" opacity="0.7" />
          <path d="M50 100 L65 55 C 60 50, 40 50, 35 55 Z" fill="currentColor" opacity="0.7" />
          <path d="M0 50 L45 35 C 50 40, 50 60, 45 65 Z" fill="currentColor" opacity="0.7" />
          {/* Four inner petals that form the star */}
          <path d="M50 20 L40 50 L50 40 Z" fill="currentColor" />
          <path d="M80 50 L50 60 L60 50 Z" fill="currentColor" />
          <path d="M50 80 L60 50 L50 60 Z" fill="currentColor" />
          <path d="M20 50 L50 40 L40 50 Z" fill="currentColor" />
        </svg>
      </div>
      <span className="logo-text">Saraswati Star Interior Design</span>
    </Link>
  );
};

export default Logo;