import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localDataService, BusRoute, Notification, Complaint } from '../lib/localData';
import { LogOut, MapPin, Clock, Bell, Bus, RefreshCw, ChevronDown, Mail, MessageSquare, Phone, User } from 'lucide-react';
import { StudentGPSView } from './StudentGPSView';
import { PaymentGateway } from './PaymentGateway';

export const UserDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [routes, setRoutes] = useState<{ [key: number]: BusRoute[] }>({});
  const [allStops, setAllStops] = useState<BusRoute[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  
  // Complaint state
  const [complaintType, setComplaintType] = useState<'delay' | 'behavior' | 'safety' | 'other'>('delay');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const hasSelectedStop = user?.selected_stop_name && user?.selected_stop_time;

  useEffect(() => {
    loadRoutes();
    if (user?.assigned_route) {
      loadNotifications();
      
      // Auto-refresh notifications every 5 seconds
      const interval = setInterval(() => {
        loadNotifications();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user?.assigned_route]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadRoutes = () => {
    const allRoutes = localDataService.getAllRoutes();
    const stops = localDataService.getAllStops();
    setRoutes(allRoutes);
    setAllStops(stops);
    setLoading(false);
  };

  const loadNotifications = () => {
    if (user?.assigned_route) {
      const allNotifications = localDataService.getNotifications(user.assigned_route);
      console.log('📱 User Dashboard - Loading notifications for route:', user.assigned_route);
      console.log('📱 User Dashboard - Found notifications:', allNotifications.length);
      setNotifications(allNotifications);
      setNotificationCount(allNotifications.length);
    }
  };

  const handleStopSelection = (stop: BusRoute) => {
    localDataService.updateUserRoute(user?.id || '', stop.route_number, stop.stop_name, stop.timing);
    updateUser({ 
      assigned_route: stop.route_number,
      selected_stop_name: stop.stop_name,
      selected_stop_time: stop.timing
    });
    loadNotifications();
    setIsDropdownOpen(false);
  };

  const getSelectedStopDisplayText = () => {
    if (!selectedStopId) return 'Select your pickup stop';
    const stop = allStops.find(s => `${s.route_number}-${s.stop_order}` === selectedStopId);
    return stop ? `${stop.stop_name} (Route ${stop.route_number})` : 'Select your pickup stop';
  };

  // Get driver for the selected route
  const getDriverForRoute = () => {
    if (!selectedRoute) return null;
    return localDataService.getDriverByRoute(selectedRoute);
  };

  const handleComplaintSubmit = () => {
    if (!complaintMessage.trim() || !user) return;

    localDataService.addComplaint({
      user_id: user.id,
      user_name: user.name,
      route_number: user.assigned_route,
      complaint_type: complaintType,
      message: complaintMessage.trim(),
      status: 'pending'
    });

    setComplaintMessage('');
    setComplaintSubmitted(true);
    setTimeout(() => {
      setComplaintSubmitted(false);
      setShowComplaintForm(false);
    }, 2000);
  };

  const selectedRoute = user?.assigned_route;
  const getSelectedStopFare = () => {
    if (!user?.selected_stop_name || !selectedRoute) return 0;
    const routeStops = routes[selectedRoute] || [];
    const selectedStop = routeStops.find(s => s.stop_name === user?.selected_stop_name);
    return selectedStop?.fare || 0;
  };

  const selectedStopFare = getSelectedStopFare();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bus className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show stop selection if not selected yet
  if (!hasSelectedStop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Bus className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
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

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Select Your Pickup Stop
            </h2>
            <p className="text-gray-600 mb-4 text-sm">Choose where you'll board the bus (one-time selection)</p>

            {/* Single Dropdown for All Stops */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-800 font-medium">
                    {getSelectedStopDisplayText()}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                  {allStops
                    .filter(stop => stop.fare && stop.fare > 0)
                    .map((stop) => (
                      <button
                        key={`${stop.route_number}-${stop.stop_order}`}
                        onClick={() => handleStopSelection(stop)}
                        className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{stop.stop_name}</div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{stop.timing}</span>
                              <span className="text-sm font-semibold text-blue-600">₹{stop.fare}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard after stop selection
  const currentRouteStops = selectedRoute ? routes[selectedRoute] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
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
            {/* User Profile Info */}
            {(user?.dept || user?.sem || user?.usn) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Student Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {user?.dept && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Department</div>
                      <div className="font-bold text-gray-800">{user.dept}</div>
                    </div>
                  )}
                  {user?.sem && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Semester</div>
                      <div className="font-bold text-gray-800">{user.sem}</div>
                    </div>
                  )}
                  {user?.usn && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">USN</div>
                      <div className="font-bold text-gray-800">{user.usn}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Stop Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Your Pickup Stop
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedRoute}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-gray-800 mb-2">{user?.selected_stop_name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Pickup Time</div>
                          <div className="font-semibold text-gray-800">{user?.selected_stop_time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Route Number</div>
                          <div className="font-semibold text-gray-800">Route {selectedRoute}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Route Details */}
            {currentRouteStops.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Route {selectedRoute}</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {currentRouteStops.map((stop) => {
                    const isMyStop = stop.stop_name === user?.selected_stop_name;
                    return (
                      <div
                        key={`${stop.route_number}-${stop.stop_order}`}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-shadow ${
                          isMyStop
                            ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 shadow-md'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isMyStop ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
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
                        {isMyStop && (
                          <div className="flex-shrink-0">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                              Your Stop
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live GPS Tracking */}
            {selectedRoute && <StudentGPSView routeNumber={selectedRoute} />}

            {/* Payment Gateway */}
            {selectedStopFare > 0 && (
              <PaymentGateway 
                amount={selectedStopFare} 
                upiId="paytm-29933657@ptybl"
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-orange-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </div>
                  Notifications
                </h2>
                <button
                  onClick={loadNotifications}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                </button>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.sender_type === 'admin' ? (
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                              <Bell className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Bus className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{notification.sender_name}</div>
                          <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Driver Contact Info */}
            {getDriverForRoute() && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact Driver
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Route {selectedRoute} Driver</div>
                  <div className="text-lg font-bold text-gray-800 mb-3">{getDriverForRoute()?.name}</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href="mailto:transport@sjbit.edu.in" className="text-blue-600 hover:underline">
                        transport@sjbit.edu.in
                      </a>
                    </div>
                    
                    {getDriverForRoute()?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${getDriverForRoute()?.phone}`} className="text-blue-600 hover:underline">
                          {getDriverForRoute()?.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Complaint/Feedback Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                Feedback & Complaints
              </h3>
              
              {!showComplaintForm ? (
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Submit Feedback
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Complaint Type
                    </label>
                    <select
                      value={complaintType}
                      onChange={(e) => setComplaintType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                    >
                      <option value="delay">Delay</option>
                      <option value="behavior">Driver Behavior</option>
                      <option value="safety">Safety Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={complaintMessage}
                      onChange={(e) => setComplaintMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                      placeholder="Describe your concern..."
                    />
                  </div>
                  
                  {complaintSubmitted && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      Complaint submitted successfully!
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleComplaintSubmit}
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setShowComplaintForm(false);
                        setComplaintMessage('');
                      }}
                      className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
