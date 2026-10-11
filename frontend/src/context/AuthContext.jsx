import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser && !auth.isAuthenticated) {
        try {
          const user = JSON.parse(storedUser);
          auth.setUser(user);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;