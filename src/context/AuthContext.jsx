import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/config';
import { loginHealthCenter, registerHealthCenter, updateFCMToken } from '../services/apiService';
import { requestNotificationPermission } from '../services/firebaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [healthCenter, setHealthCenter] = useState(null);  // ✅ Changed from 'station'
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const centerData = localStorage.getItem(STORAGE_KEYS.CENTER_DATA);  // ✅ Changed from STATION_DATA
      
      console.log('Checking auth on mount:', { hasToken: !!token, hasCenter: !!centerData });
      
      if (token && centerData) {
        try {
          const parsed = JSON.parse(centerData);
          setHealthCenter(parsed);  // ✅ Changed from setStation
          console.log('Auth restored from localStorage:', parsed);
        } catch (error) {
          console.error('Error parsing health center data:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register new health center
  const register = async (formData) => {
    try {
      setLoading(true);
      const response = await registerHealthCenter(formData);
      
      console.log('Registration response:', response);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        return true;
      }
      
      toast.error(response.error || 'Registration failed');
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login health center - FIXED LOGIN LOGIC
  const login = async (phone) => {
    try {
      setLoading(true);
      console.log('Attempting login with phone:', phone);
      
      const response = await loginHealthCenter(phone);
      
      console.log('Login response:', response);
      
      // ✅ FIXED: Check response.success directly (not response.data.success)
      // Backend returns: { success: true, data: { id, centerName, phone, location }, message: '...' }
      if (response.success && response.data) {
        const centerData = response.data;
        
        console.log('Login successful, saving data:', centerData);
        
        // IMPORTANT: Save to localStorage FIRST
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'authenticated');
        localStorage.setItem(STORAGE_KEYS.CENTER_DATA, JSON.stringify(centerData));  // ✅ Changed
        
        // Then update state
        setHealthCenter(centerData);  // ✅ Changed from setStation
        console.log('Health center state updated:', centerData);
        
        // Handle FCM in background - DON'T let it block login
        handleFCMToken(centerData.phone).catch(err => {  // ✅ Use phone instead of id
          console.warn('FCM setup failed (non-critical):', err);
        });
        
        toast.success(`Welcome, ${centerData.centerName}!`);  // ✅ Changed from stationName
        
        // IMPORTANT: Set loading to false BEFORE returning
        setLoading(false);
        
        console.log('Login result: true');
        return true;
      }
      
      console.log('Login result: false - Invalid response');
      setLoading(false);
      toast.error(response.error || 'Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
      console.log('Login result: false - Exception');
      return false;
    }
  };

  // Handle FCM token separately - non-blocking
  const handleFCMToken = async (phone) => {  // ✅ Changed parameter from stationId to phone
    try {
      console.log('Requesting notification permission...');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        console.log('FCM token received, updating...');
        localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
        await updateFCMToken(phone, fcmToken);  // ✅ Use phone
        console.log('FCM token updated successfully');
      } else {
        console.warn('No FCM token received');
      }
    } catch (fcmError) {
      // Don't fail login if FCM fails
      console.warn('FCM token setup failed:', fcmError.message);
    }
  };

  // Logout
  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CENTER_DATA);  // ✅ Changed from STATION_DATA
    localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    setHealthCenter(null);  // ✅ Changed from setStation
    toast.success('Logged out successfully');
  };

  const value = {
    healthCenter,      // ✅ Changed from 'station'
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!healthCenter,  // ✅ Changed from !!station
  };

  console.log('AuthContext value:', { 
    hasHealthCenter: !!healthCenter,  // ✅ Changed
    loading, 
    isAuthenticated: !!healthCenter  // ✅ Changed
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};