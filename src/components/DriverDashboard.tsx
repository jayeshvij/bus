import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localDataService, BusRoute } from '../lib/localData';
import { LogOut, MapPin, Clock, Send, Radio } from 'lucide-react';
import { LiveGPS } from './LiveGPS';

export const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.assigned_route) {
      loadRoute();
    } else {
      setLoading(false);
    }
  }, [user?.assigned_route]);

  const loadRoute = () => {
    if (user?.assigned_route) {
      const routeStops = localDataService.getRouteStops(user.assigned_route);
      setRoutes(routeStops);
    }
    setLoading(false);
  };

  const sendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSending(true);
    
    // Add notification using local data service - only for users on this route
    localDataService.addNotification({
      sender_type: 'driver',
      sender_id: user.id,
      sender_name: user.name,
      route_number: user.assigned_route || null,
      message: message.trim()
    });

    setMessage('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.assigned_route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No route assigned</p>
          <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Driver Portal</h1>
                <p className="text-sm text-gray-500">
                  {user?.name} - Bus {user?.bus_no}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live GPS Component */}
            <LiveGPS 
              driverId={user?.id || ''} 
              driverName={user?.name || ''} 
              routeNumber={user?.assigned_route || 0}
            />

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Route {user?.assigned_route} - All Stops</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {routes.map((stop) => (
                  <div
                    key={`${stop.route_number}-${stop.stop_order}`}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {stop.stop_order}
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">{stop.stop_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{stop.timing}</span>
                      </div>
                      <div className="text-gray-600 font-medium">₹{stop.fare}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-blue-600" />
                Send Notification
              </h2>
              <form onSubmit={sendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message to Route {user?.assigned_route} Students
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                    rows={6}
                    placeholder="e.g., Running 10 minutes late due to traffic"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    sending || !message.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Notify students about delays</li>
                  <li>• Share route changes</li>
                  <li>• Update arrival times</li>
                  <li>• Keep messages brief and clear</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800">
                  <strong>Note:</strong> Notifications are sent only to students on Route {user?.assigned_route}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
