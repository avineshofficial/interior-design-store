import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Wait for the authentication state to be determined
  if (loading) {
     return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  // If loading is finished and there is no user, redirect to login
  if (!currentUser) {
    return <Navigate to="/auth/signin" />;
  }

  // If a user is logged in (can be a customer or an admin), allow access
  return children;
};

export default ProtectedRoute;