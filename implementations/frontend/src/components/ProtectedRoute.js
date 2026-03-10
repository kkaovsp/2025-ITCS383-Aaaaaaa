import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // user === undefined => still loading
  if (user === undefined) return null;

  // user === null => not authenticated
  if (user === null) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}
