import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingCart, FiMenu, FiX, FiLogIn, FiUser, FiMapPin, FiShoppingBag, FiGrid, FiLogOut, FiArchive,FiHome } from 'react-icons/fi';
import ProfileDropdown from './ProfileDropdown';
import Logo from '../Logo/Logo';
import './Header.css';

const Header = () => {
  const { itemCount } = useCart();
  const { currentUser, userProfile, logout } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => setIsNavOpen(false);

  const handleMobileLogout = async () => {
    closeMobileMenu();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Logo />

        <nav className="main-nav-desktop">
          <NavLink to="/" onClick={closeMobileMenu}>
            <FiHome /> Home
          </NavLink>
          <NavLink to="/products" onClick={closeMobileMenu}>
            <FiShoppingBag /> Products
          </NavLink>
        </nav>

        <nav className={`main-nav-mobile ${isNavOpen ? 'active' : ''}`}>
          <div className="mobile-nav-header">
            <h2 className="mobile-nav-title">Menu</h2>
            <button className="mobile-nav-close" onClick={closeMobileMenu}><FiX /></button>
          </div>
          <NavLink to="/" onClick={closeMobileMenu}>
            <FiHome /> Home
          </NavLink>
          <NavLink to="/products" onClick={closeMobileMenu}>
            <FiShoppingBag /> Products
          </NavLink>
          <div className="mobile-menu-separator"></div>

          {currentUser && userProfile ? (
            <div className="mobile-user-menu">
              {/* --- The onClick calls are now CORRECT --- */}
              <NavLink to="/profile" className="mobile-user-link" onClick={closeMobileMenu}><FiUser /> My Profile</NavLink>
              <NavLink to="/addresses" className="mobile-user-link" onClick={closeMobileMenu}><FiMapPin /> My Addresses</NavLink>
              <NavLink to="/orders" className="mobile-user-link" onClick={closeMobileMenu}><FiShoppingBag /> My Orders</NavLink>
              <NavLink to="/order-history" className="mobile-user-link" onClick={closeMobileMenu}><FiArchive /> Order History</NavLink>
              {userProfile.role === 'admin' && (
                 <NavLink to="/admin" className="mobile-user-link admin-mobile" onClick={closeMobileMenu}><FiGrid /> Admin Dashboard</NavLink>
              )}
              <button className="mobile-logout-btn" onClick={handleMobileLogout}><FiLogOut /> Logout</button>
            </div>
          ) : (
            <div className="mobile-user-menu">
                <NavLink to="/auth/signin" className="mobile-user-link" onClick={closeMobileMenu}>
                  <FiLogIn />
                  <span>Login / Sign Up</span>
                </NavLink>
            </div>
          )}
        </nav>
        {isNavOpen && <div className="nav-overlay" onClick={closeMobileMenu}></div>}

        <div className="header-actions">
          <Link to="/cart" className="cart-link icon-link">
            <FiShoppingCart />
            <span className="link-text">Cart</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <div className="desktop-auth">
            {currentUser ? <ProfileDropdown /> : <Link to="/auth/signin" className="login-button">Login</Link>}
          </div>

          <button className="nav-toggle" onClick={() => setIsNavOpen(true)}>
            <FiMenu />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;