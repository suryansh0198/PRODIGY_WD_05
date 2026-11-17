import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, updateUserPreferences } from '../services/authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('commutecast_token'));
  const [loading, setLoading] = useState(true);

  // Initialize session from token on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('commutecast_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  async function login(email, password) {
    const data = await loginUser(email, password);
    if (data.token) {
      localStorage.setItem('commutecast_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  async function register(name, email, password, preferredTransport) {
    const data = await registerUser(name, email, password, preferredTransport);
    if (data.token) {
      localStorage.setItem('commutecast_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('commutecast_token');
    setToken(null);
    setUser(null);
  }

  async function updateTransport(preferredTransport) {
    const data = await updateUserPreferences(preferredTransport);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateTransport,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
