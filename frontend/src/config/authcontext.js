'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const AuthProviderWithRouter = ({ children }) => {
  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
        credentials
      );
      setAccessToken(response.data.jwt);
      setUser(response.data.user);
      localStorage.setItem('accessToken', response.data.jwt);
      toast.success('Login successful');
      router.push('/chat'); // Redirect to chat page after login
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  // Logout function
  const logout = () => {
    router.push('/login'); // Redirect to login page after logout
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  // Validate token on page load or refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      if (storedAccessToken) {
        try {
          // Validate the token by fetching the authenticated user's details
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
            {
              headers: { Authorization: `Bearer ${storedAccessToken}` },
            }
          );
          setAccessToken(storedAccessToken);
          setUser(response.data);
          router.push('/chat'); 
        } catch (error) {
          console.error('Token validation failed:', error);
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem('accessToken');
          if (pathname.startsWith('/chat')) {
            router.push('/login'); 
          }
        }
      } else {
        // If no token is found, redirect to login if on a protected route
        if (pathname.startsWith('/chat')) {
          router.push('/login');
        }
      }
    };

    initializeAuth(); // Call the function
  }, [router, pathname]);

  return (
    <AuthContext.Provider
      value={{
        token: accessToken,
        user,
        isAuthenticated: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// AuthProvider component to handle mounting state
export const AuthProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <AuthProviderWithRouter>{children}</AuthProviderWithRouter> : null;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};