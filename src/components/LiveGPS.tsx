import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Maximize2, Minimize2 } from 'lucide-react';

interface LiveGPSProps {
  driverId: string;
  driverName: string;
  routeNumber: number;
}

interface GPSPosition {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  speed: number | null;
}

export const LiveGPS: React.FC<LiveGPSProps> = ({ driverId, driverName, routeNumber }) => {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let watchId: number;

    if (isSharing) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newPosition: GPSPosition = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed
            };
            setPosition(newPosition);
            
            // Save to localStorage for other tabs to access
            localStorage.setItem(
              `gps_driver_${driverId}`,
              JSON.stringify({
                ...newPosition,
                driverName,
                routeNumber,
                isSharing: true
              })
            );
            
            setError('');
          },
          (err) => {
            setError('Unable to get location. Please enable GPS.');
            console.error('GPS error:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
      }
    } else {
      // Clear GPS data when stopped
      localStorage.removeItem(`gps_driver_${driverId}`);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isSharing, driverId, driverName, routeNumber]);

  const toggleSharing = () => {
    setIsSharing(!isSharing);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className={`w-6 h-6 ${isSharing ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
            Live GPS Tracking
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleSharing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                isSharing
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isSharing ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Stop Sharing
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Start Sharing
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isSharing && position ? (
          <div className="space-y-4">
            {/* Live Status Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700">Broadcasting Live Location</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">Route</div>
                  <div className="font-bold text-gray-800">Route {routeNumber}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">Accuracy</div>
                  <div className="font-bold text-gray-800">±{Math.round(position.accuracy)}m</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">Speed</div>
                  <div className="font-bold text-gray-800">
                    {position.speed ? `${Math.round(position.speed * 3.6)} km/h` : 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">Last Update</div>
                  <div className="font-bold text-gray-800">
                    {new Date(position.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Map View */}
            <div className={`bg-gray-100 rounded-lg overflow-hidden ${isFullscreen ? 'h-[calc(100vh-250px)]' : 'h-96'}`}>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${position.latitude},${position.longitude}&zoom=16&maptype=roadmap`}
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
                  {position.latitude.toFixed(6)}°
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Longitude</span>
                </div>
                <div className="font-mono text-lg font-bold text-gray-800">
                  {position.longitude.toFixed(6)}°
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Navigation className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">GPS tracking is {isSharing ? 'starting...' : 'not active'}</p>
            <p className="text-sm text-gray-500">
              {isSharing 
                ? 'Waiting for GPS signal...' 
                : 'Click "Start Sharing" to broadcast your location to students'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

