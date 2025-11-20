import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getDirectionsUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AlertCard = ({ alert: alertData }) => {  // ✅ FIXED: Renamed to avoid conflict with alert()
  const navigate = useNavigate();
  const { healthCenter } = useAuth();  // ✅ FIXED: Changed from 'station' to 'healthCenter'

  const handleViewOnMap = () => {
    navigate(`/map/${alertData._id}`);
  };

  const handleGetDirections = () => {
    console.log('🗺️ Get Directions clicked');
    console.log('Health Center:', healthCenter);
    console.log('Alert:', alertData);

    if (!healthCenter) {
      console.error('❌ No health center data available');
      window.alert('Health center information not available. Please log in again.');  // ✅ Using window.alert
      return;
    }

    if (!alertData) {
      console.error('❌ No alert data available');
      window.alert('Alert information not available.');  // ✅ Using window.alert
      return;
    }

    // ✅ Get health center coordinates - check multiple formats
    let stationLat, stationLng;
    if (healthCenter.location) {
      stationLat = healthCenter.location.lat;
      stationLng = healthCenter.location.lng;
    } else if (healthCenter.lat && healthCenter.lng) {
      stationLat = healthCenter.lat;
      stationLng = healthCenter.lng;
    }

    // ✅ Get alert coordinates - check multiple formats
    let userLat, userLng;
    if (alertData.location) {
      userLat = alertData.location.lat;
      userLng = alertData.location.lng;
    } else if (alertData.lat && alertData.lng) {
      userLat = alertData.lat;
      userLng = alertData.lng;
    }

    console.log('📍 Extracted coordinates:', {
      healthCenter: { lat: stationLat, lng: stationLng },
      alert: { lat: userLat, lng: userLng }
    });

    // Validate coordinates
    if (!stationLat || !stationLng) {
      console.error('❌ Health center coordinates missing:', healthCenter);
      window.alert('Health center location not available. Please update your profile.');  // ✅ Using window.alert
      return;
    }

    if (!userLat || !userLng) {
      console.error('❌ Alert coordinates missing:', alertData);
      window.alert('Alert location not available.');  // ✅ Using window.alert
      return;
    }

    const directionsUrl = getDirectionsUrl(stationLat, stationLng, userLat, userLng);
    
    console.log('✅ Opening Google Maps:', directionsUrl);
    window.open(directionsUrl, '_blank');
  };

  // ✅ Handle phone call
  const handleCallUser = () => {
    const phoneNumber = alertData.userPhone || alertData.phone;
    
    if (!phoneNumber) {
      window.alert('User phone number not available');  // ✅ Using window.alert
      return;
    }

    console.log('📞 Calling user:', phoneNumber);
    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  // Helper to get coordinates from alert
  const getAlertCoordinates = () => {
    if (alertData.location) {
      return { lat: alertData.location.lat, lng: alertData.location.lng };
    }
    if (alertData.lat && alertData.lng) {
      return { lat: alertData.lat, lng: alertData.lng };
    }
    return null;
  };

  const coords = getAlertCoordinates();
  const userPhone = alertData.userPhone || alertData.phone;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
      {/* Alert Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Medical Emergency - Health Assistance</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(alertData.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            alertData.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : alertData.status === 'acknowledged'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          Status: {alertData.status.charAt(0).toUpperCase() + alertData.status.slice(1)}
        </span>
      </div>

      {/* Location Info */}
      {coords ? (
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Location Coordinates</h4>
          <p className="text-sm text-gray-900 font-mono">
            Lat: {coords.lat.toFixed(6)}
            <br />
            Lng: {coords.lng.toFixed(6)}
          </p>
          {alertData.distance && (
            <p className="text-sm text-gray-600 mt-2">
              📍 {alertData.distance.toFixed(2)} km from your health center
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">⚠️ Location coordinates unavailable</p>
        </div>
      )}

      {/* ✅ User Contact Info */}
      {userPhone && (
        <div className="mb-4 bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-semibold text-green-700 mb-2">Patient Information</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-semibold">Phone Number:</p>
              <p className="text-lg text-gray-900 font-mono">{userPhone}</p>
            </div>
            <button
              onClick={handleCallUser}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              title="Call Patient"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        </div>
      )}

      {/* User ID (fallback if no phone) */}
      {alertData.userId && !userPhone && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">User ID:</span> {alertData.userId}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleViewOnMap}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span>View on Map</span>
        </button>
        <button
          onClick={handleGetDirections}
          disabled={!coords}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            coords
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span>Get Directions</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;