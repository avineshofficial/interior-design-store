import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './BackButton.css';

/**
 * A reusable back button.
 * Navigates to a specific path if the 'to' prop is provided.
 * Otherwise, it navigates to the previous page in the browser's history.
 */
const BackButton = ({ to, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back one step in history
    }
  };

  return (
    <button onClick={handleClick} className="back-button">
      <FiArrowLeft />
      <span>{children || 'Back'}</span>
    </button>
  );
};

export default BackButton;