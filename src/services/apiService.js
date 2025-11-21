import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register health center
export const registerHealthCenter = async (centerData) => {
  try {
    const response = await api.post(API_ENDPOINTS.HEALTH_REGISTER, centerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Login health center
export const loginHealthCenter = async (phone) => {
  try {
    const response = await api.post(API_ENDPOINTS.HEALTH_LOGIN, { phone });
    
    // Store auth data
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'authenticated');
      localStorage.setItem(STORAGE_KEYS.CENTER_DATA, JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update FCM token
export const updateFCMToken = async (phone, fcmToken) => {
  try {
    const response = await api.post(API_ENDPOINTS.UPDATE_FCM_TOKEN, {
      phone,
      fcmToken,
    });
    
    // Store FCM token
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ✅ FIXED: Get AMBULANCE alerts for THIS SPECIFIC center only
 */
export const getAlerts = async () => {
  try {
    console.log('📡 Fetching ambulance alerts for this health center...');
    
    // Get the logged-in center's data
    const centerData = localStorage.getItem(STORAGE_KEYS.CENTER_DATA);
    
    if (!centerData) {
      throw new Error('Center data not found. Please log in again.');
    }
    
    const center = JSON.parse(centerData);
    const centerId = center.id;
    
    // ✅ CRITICAL FIX: Filter alerts by this center's ID to only get alerts assigned to THIS center
    const response = await api.get(`/alerts/station/${centerId}?type=ambulance`);
    console.log('📦 Alerts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    throw error.response?.data || error;
  }
};

// Get alert by ID
export const getAlertById = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.ALERT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update alert status
export const updateAlertStatus = async (id, status) => {
  try {
    const response = await api.patch(API_ENDPOINTS.UPDATE_ALERT_STATUS(id), {
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all health centers
export const getAllHealthCenters = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.HEALTH_CENTERS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get auth data from localStorage
export const getAuthData = () => {
  const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const centerData = localStorage.getItem(STORAGE_KEYS.CENTER_DATA);
  
  if (authToken && centerData) {
    return {
      isAuthenticated: true,
      center: JSON.parse(centerData),
    };
  }
  
  return {
    isAuthenticated: false,
    center: null,
  };
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CENTER_DATA);
  localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
};

export default api;