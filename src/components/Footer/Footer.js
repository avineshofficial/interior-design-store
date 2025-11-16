import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Saraswati Star Interior Design</h4>
          <p>Crafting beautiful and functional living spaces with a touch of elegance.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/cart">Your Cart</a></li>
            <li><a href="/admin">Admin Login</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: contact@saraswatistar.com</p>
          <p>Phone: +91 98765 43210</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Saraswati Star Interior Design. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;