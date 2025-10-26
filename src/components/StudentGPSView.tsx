import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface StudentGPSViewProps {
  routeNumber: number;
}

interface DriverGPSData {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  speed: number | null;
  driverName: string;
  routeNumber: number;
  isSharing: boolean;
}

export const StudentGPSView: React.FC<StudentGPSViewProps> = ({ routeNumber }) => {
  const [gpsData, setGpsData] = useState<DriverGPSData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadGPSData = () => {
    // Check all drivers' GPS data
    const allDrivers = Object.keys(localStorage)
      .filter(key => key.startsWith('gps_driver_'))
      .map(key => {
        try {
          return JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          return null;
        }
      })
      .filter(data => data && data.routeNumber === routeNumber && data.isSharing);

    if (allDrivers.length > 0) {
      setGpsData(allDrivers[0]);
      setLastUpdate(new Date().toLocaleTimeString());
    } else {
      setGpsData(null);
    }
  };

  useEffect(() => {
    // Initial load
    loadGPSData();

    // Auto-refresh every 3 seconds
    const interval = setInterval(loadGPSData, 3000);

    return () => clearInterval(interval);
  }, [routeNumber]);

  if (!gpsData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-gray-400" />
          Live Bus Location
        </h2>
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-12 text-center">
          <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Driver GPS not available</p>
          <p className="text-sm text-gray-500">Your driver hasn't started sharing location yet</p>
        </div>
      </div>
    );
  }

  const timeSinceUpdate = new Date().getTime() - new Date(gpsData.timestamp).getTime();
  const isRecent = timeSinceUpdate < 30000; // Less than 30 seconds

  return (
    <div className={`bg-white rounded-xl shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className={`w-6 h-6 ${isRecent ? 'text-green-600 animate-pulse' : 'text-orange-500'}`} />
            Live Bus Location
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadGPSData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh location"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg p-4 border-2 mb-4 ${
          isRecent 
            ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300' 
            : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecent ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
              <span className={`font-semibold ${isRecent ? 'text-green-700' : 'text-orange-700'}`}>
                {isRecent ? 'Live Tracking Active' : 'Last Known Position'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Driver: <span className="font-semibold">{gpsData.driverName}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Route</div>
              <div className="font-bold text-gray-800">Route {gpsData.routeNumber}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Accuracy</div>
              <div className="font-bold text-gray-800">±{Math.round(gpsData.accuracy)}m</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Speed</div>
              <div className="font-bold text-gray-800">
                {gpsData.speed ? `${Math.round(gpsData.speed * 3.6)} km/h` : 'N/A'}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Last Update</div>
              <div className="font-bold text-gray-800">
                {lastUpdate}
              </div>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className={`bg-gray-100 rounded-lg overflow-hidden mb-4 ${isFullscreen ? 'h-[calc(100vh-250px)]' : 'h-96'}`}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${gpsData.latitude},${gpsData.longitude}&zoom=16&maptype=roadmap`}
            allowFullScreen
          />
        </div>

        {/* Coordinates Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Latitude</span>
            </div>
            <div className="font-mono text-lg font-bold text-gray-800">
              {gpsData.latitude.toFixed(6)}°
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Longitude</span>
            </div>
            <div className="font-mono text-lg font-bold text-gray-800">
              {gpsData.longitude.toFixed(6)}°
            </div>
          </div>
        </div>

        {!isRecent && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              ⚠️ Location data is more than 30 seconds old. Driver may have stopped sharing or lost connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

