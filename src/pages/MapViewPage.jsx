import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, Clock, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { formatDate, getDirectionsUrl, calculateDistance } from '../utils/helpers';
import toast from 'react-hot-toast';

const MapViewPage = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { healthCenter } = useAuth();  // ✅ FIXED: Changed from 'station' to 'healthCenter'
  const { alerts } = useAlerts();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 MapViewPage - Looking for alert:', alertId);
    console.log('Available alerts:', alerts);
    console.log('Health Center data:', healthCenter);  // ✅ Changed log message

    // Find the alert from the alerts context
    const foundAlert = alerts.find((a) => a._id === alertId);
    if (foundAlert) {
      console.log('✅ Found alert:', foundAlert);
      setAlert(foundAlert);
      setLoading(false);
    } else {
      console.error('❌ Alert not found:', alertId);
      toast.error('Alert not found');
      setLoading(false);
    }
  }, [alertId, alerts, healthCenter]);  // ✅ Changed dependency

  const handleGetDirections = () => {
    console.log('🔍 Get Directions clicked from MapView');
    console.log('Health Center:', healthCenter);  // ✅ Changed log message
    console.log('Alert:', alert);

    if (!healthCenter) {  // ✅ Changed from 'station'
      console.error('❌ No health center data');
      toast.error('Health center information not available');  // ✅ Changed message
      return;
    }

    if (!alert) {
      console.error('❌ No alert data');
      toast.error('Alert information not available');
      return;
    }

    // ✅ Get health center coordinates - support multiple formats
    let stationLat, stationLng;
    if (healthCenter.location) {  // ✅ Changed from 'station'
      stationLat = healthCenter.location.lat;
      stationLng = healthCenter.location.lng;
    } else if (healthCenter.lat && healthCenter.lng) {  // ✅ Changed from 'station'
      stationLat = healthCenter.lat;
      stationLng = healthCenter.lng;
    }

    // ✅ Get alert coordinates - support multiple formats
    let userLat, userLng;
    if (alert.location) {
      userLat = alert.location.lat;
      userLng = alert.location.lng;
    } else if (alert.lat && alert.lng) {
      userLat = alert.lat;
      userLng = alert.lng;
    }

    console.log('📍 Extracted coordinates:', {
      healthCenter: { lat: stationLat, lng: stationLng },  // ✅ Changed log message
      alert: { lat: userLat, lng: userLng }
    });

    // Validate all coordinates exist
    if (!stationLat || !stationLng) {
      console.error('❌ Health center coordinates missing');  // ✅ Changed message
      toast.error('Health center location not available');  // ✅ Changed message
      return;
    }

    if (!userLat || !userLng) {
      console.error('❌ Alert coordinates missing');
      toast.error('Alert location not available');
      return;
    }

    const directionsUrl = getDirectionsUrl(stationLat, stationLng, userLat, userLng);
    
    console.log('✅ Opening Google Maps:', directionsUrl);
    window.open(directionsUrl, '_blank');
    toast.success('Opening Google Maps...');
  };

  // ✅ Handle phone call
  const handleCallUser = () => {
    const phoneNumber = alert?.userPhone || alert?.phone;
    
    if (!phoneNumber) {
      toast.error('User phone number not available');
      return;
    }

    console.log('📞 Calling user:', phoneNumber);
    toast.success(`Calling ${phoneNumber}...`);
    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  // Helper to get alert coordinates
  const getAlertLocation = () => {
    if (!alert) return null;
    
    if (alert.location) {
      return { lat: alert.location.lat, lng: alert.location.lng };
    }
    if (alert.lat && alert.lng) {
      return { lat: alert.lat, lng: alert.lng };
    }
    return null;
  };

  // Helper to get health center coordinates
  const getStationLocation = () => {
    if (!healthCenter) return null;  // ✅ Changed from 'station'
    
    if (healthCenter.location) {  // ✅ Changed from 'station'
      return { lat: healthCenter.location.lat, lng: healthCenter.location.lng };
    }
    if (healthCenter.lat && healthCenter.lng) {  // ✅ Changed from 'station'
      return { lat: healthCenter.lat, lng: healthCenter.lng };
    }
    return null;
  };

  if (loading) {
    return <Loading message="Loading map..." />;
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Not Found</h2>
            <p className="text-gray-600 mb-6">
              The alert you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const alertLocation = getAlertLocation();
  const stationLocation = getStationLocation();
  const userPhone = alert.userPhone || alert.phone;
  
  // Calculate distance if we have both locations
  const distance = stationLocation && alertLocation
    ? calculateDistance(
        stationLocation.lat,
        stationLocation.lng,
        alertLocation.lat,
        alertLocation.lng
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Alert Details Sidebar */}
        <div className="lg:w-96 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Alert Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Alert Details</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  alert.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : alert.status === 'acknowledged'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {alert.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDate(alert.createdAt)}</span>
            </div>
          </div>

          {/* Alert Information */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Alert Type</h3>
              <p className="text-lg font-medium text-gray-900">Health Assistance</p>
            </div>

            {alertLocation ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Emergency Location</h3>
                <p className="text-sm text-gray-900 font-mono">
                  Lat: {alertLocation.lat.toFixed(6)}
                  <br />
                  Lng: {alertLocation.lng.toFixed(6)}
                </p>
                {distance && (
                  <p className="text-sm text-gray-600 mt-2">
                    📍 {distance} km from your health center
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">⚠️ Location coordinates unavailable</p>
              </div>
            )}

            {/* Call Patient Button */}
            {userPhone && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-semibold text-green-700 mb-2">Caller Information</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Phone Number:</p>
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

            {/* Health Center Info */}
            {!stationLocation && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-700 mb-2">⚠️ Station Info</h3>
                <p className="text-sm text-yellow-800">
                  Station location not available. Please update your profile.
                </p>
              </div>
            )}

            {/* User ID (fallback if no phone) */}
            {alert.userId && !userPhone && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">User ID</h3>
                <p className="text-sm text-gray-900 font-mono">{alert.userId}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleGetDirections}
            disabled={!alertLocation || !stationLocation}
            className={`w-full flex items-center justify-center space-x-2 font-medium py-3 rounded-lg transition-colors ${
              alertLocation && stationLocation
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span>Navigate to Location</span>
          </button>

          {/* Info */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              📍 Click the button above to open Google Maps with turn-by-turn navigation to the
              emergency location.
            </p>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 h-96 lg:h-auto">
          <Map
            stationLocation={stationLocation}
            alertLocation={alertLocation}
            onGetDirections={handleGetDirections}
            emergencyType="health" 
          />
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;