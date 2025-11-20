// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase Cloud Messaging VAPID Key
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Alert Sound URL
export const ALERT_SOUND_URL = '/alert-sound.mp3';

// App Constants
export const APP_NAME = 'RapidAid Health Center Dashboard';
export const APP_VERSION = '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rapidaid_health_auth_token',
  CENTER_DATA: 'rapidaid_health_center_data',
  FCM_TOKEN: 'rapidaid_health_fcm_token',
};

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH_LOGIN: '/health/login',
  HEALTH_REGISTER: '/health/register',
  HEALTH_CENTERS: '/health/centers',
  UPDATE_FCM_TOKEN: '/health/update-token',
  HEALTH_ALERTS: '/alerts?type=ambulance',
  ALERT_BY_ID: (id) => `/alerts/${id}`,
  UPDATE_ALERT_STATUS: (id) => `/alerts/${id}/status`,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 6.9271, lng: 79.8612 },
  DEFAULT_ZOOM: 12,
  STATION_MARKER_COLOR: '#16a34a',  // Green for health centers
  ALERT_MARKER_COLOR: '#22c55e',     // Light green for medical alerts
};