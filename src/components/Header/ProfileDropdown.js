import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
// --- FIX: Import FiArchive here ---
import { FiGrid, FiUser, FiMapPin, FiLogOut, FiShoppingBag, FiArchive } from 'react-icons/fi';
import './Header.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, logout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // --- FIX: Define the handleLinkClick function here ---
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    handleLinkClick(); // This will close the menu
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        {userProfile && userProfile.photoURL ? (
          <img src={userProfile.photoURL} alt="My Profile" className="dropdown-avatar" />
        ) : (
          <FaUserCircle />
        )}
      </button>

      <div className={`dropdown-menu ${isOpen ? 'active' : ''}`}>
        <div className="dropdown-header">
          Signed in as <br/> <strong>{userProfile?.displayName || userProfile?.email}</strong>
        </div>
        
        <Link to="/profile" className="dropdown-item" onClick={handleLinkClick}>
          <FiUser/> My Profile
        </Link>
        <Link to="/addresses" className="dropdown-item" onClick={handleLinkClick}>
          <FiMapPin/> My Addresses
        </Link>
        <Link to="/orders" className="dropdown-item" onClick={handleLinkClick}>
          <FiShoppingBag/> My Orders
        </Link>
        <Link to="/order-history" className="dropdown-item" onClick={handleLinkClick}>
          <FiArchive /> Order History
        </Link>
        
        {userProfile?.role === 'admin' && (
           <Link to="/admin" className="dropdown-item admin-link" onClick={handleLinkClick}>
            <FiGrid/> Admin Dashboard
          </Link>
        )}

        <button onClick={handleLogout} className="dropdown-item logout-btn">
          <FiLogOut/> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;