import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      // Check if backend is not available (network error, connection refused, etc.)
      const isBackendUnavailable = 
        !error.response || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to fetch');

      // If backend is unavailable, use mock authentication for development
      if (isBackendUnavailable) {
        // Validate credentials locally
        if (credentials.username === 'admin' && credentials.password === 'admin') {
          const mockUser = {
            id: 1,
            name: 'Admin',
            username: 'admin',
            role: 'Administrator',
            email: 'admin@dids.local',
          };
          const mockToken = 'mock-jwt-token-for-development';
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setUser(mockUser);
          return { success: true };
        } else {
          return {
            success: false,
            error: 'Invalid username or password. Use admin/admin for development mode.',
          };
        }
      }

      // Backend is available but returned an error
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

