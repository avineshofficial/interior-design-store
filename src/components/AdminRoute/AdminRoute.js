import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  // First, check if a user is logged in
  if (!currentUser) {
    return <Navigate to="/auth/signin" />;
  }

  // Next, wait for their profile data to load
  if (!userProfile) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Verifying access...</div>;
  }
  
  // Finally, check if their role is 'admin'
  if (userProfile.role !== 'admin') {
    return <Navigate to="/" />; // If not an admin, send them to the homepage
  }
  
  // If all checks pass, allow access
  return children;
};

export default AdminRoute;