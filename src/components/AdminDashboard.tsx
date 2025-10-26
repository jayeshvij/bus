import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localDataService, BusRoute, Driver, Complaint } from '../lib/localData';
import { LogOut, Send, Users, Bus, Route, Bell, TrendingUp, ChevronDown, ChevronUp, MessageSquare, Phone, Edit } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [routes, setRoutes] = useState<{ [key: number]: BusRoute[] }>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<{ [key: number]: boolean }>({});
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRoutes: 4,
    activeNotifications: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load routes
    const allRoutes = localDataService.getAllRoutes();
    setRoutes(allRoutes);

    // Load drivers
    const allDrivers = localDataService.getDrivers();
    setDrivers(allDrivers);

    // Load complaints
    const allComplaints = localDataService.getComplaints();
    setComplaints(allComplaints);

    // Load users
    const allUsers = localDataService.getUsers();

    // Load notifications
    const notifications = localDataService.getRecentNotifications();

    // Update stats
    setStats({
      totalUsers: allUsers.length,
      totalDrivers: allDrivers.length,
      totalRoutes: 4,
      activeNotifications: notifications.length
    });
  };

  const toggleRouteExpansion = (routeNum: number) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeNum]: !prev[routeNum]
    }));
  };

  const sendSystemNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSending(true);
    
    localDataService.addNotification({
      sender_type: 'admin',
      sender_id: user.id,
      sender_name: user.name,
      route_number: null,
      message: message.trim()
    });

    setMessage('');
    setSending(false);
    setStats({ ...stats, activeNotifications: stats.activeNotifications + 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Control Panel</h1>
                <p className="text-sm text-gray-500">System Management</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <div className="text-blue-100 text-sm">Total Students</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Bus className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalDrivers}</div>
            <div className="text-green-100 text-sm">Active Drivers</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Route className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalRoutes}</div>
            <div className="text-purple-100 text-sm">Bus Routes</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Bell className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.activeNotifications}</div>
            <div className="text-orange-100 text-sm">Notifications Sent</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bus className="w-6 h-6 text-blue-600" />
                Driver Management
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Driver</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Bus No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{driver.name}</td>
                        <td className="py-3 px-4 text-gray-600">{driver.id}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {driver.assigned_route ? `Route ${driver.assigned_route}` : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{driver.bus_no || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {editingDriverId === driver.id ? (
                            <input
                              type="text"
                              value={editingPhone}
                              onChange={(e) => setEditingPhone(e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                              placeholder="Enter phone number"
                              autoFocus
                            />
                          ) : (
                            <span className="text-gray-600 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {driver.phone || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingDriverId === driver.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  localDataService.updateDriverPhone(driver.id, editingPhone);
                                  setEditingDriverId(null);
                                  setEditingPhone('');
                                  loadDashboardData();
                                }}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDriverId(null);
                                  setEditingPhone('');
                                }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingDriverId(driver.id);
                                setEditingPhone(driver.phone || '');
                              }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Route className="w-6 h-6 text-green-600" />
                All Routes Overview
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((routeNum) => {
                  const routeStops = routes[routeNum] || [];
                  const isExpanded = expandedRoutes[routeNum];
                  
                  return (
                    <div
                      key={routeNum}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleRouteExpansion(routeNum)}
                        className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {routeNum}
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-800">Route {routeNum}</h3>
                            <p className="text-sm text-gray-600">{routeStops.length} stops</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-blue-600" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-blue-200">
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {routeStops.map((stop) => (
                              <div key={`${stop.route_number}-${stop.stop_order}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {stop.stop_order}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-800">{stop.stop_name}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {stop.timing} • <span className="font-medium">₹{stop.fare}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-orange-600" />
                System Broadcast
              </h2>
              <form onSubmit={sendSystemNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message to All Users
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none resize-none"
                    rows={6}
                    placeholder="e.g., All routes will be delayed by 30 minutes due to weather conditions"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    sending || !message.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {sending ? 'Broadcasting...' : 'Broadcast to All'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Broadcast Info</h3>
                <ul className="text-xs text-orange-800 space-y-1">
                  <li>• Reaches all students and drivers</li>
                  <li>• Use for system-wide announcements</li>
                  <li>• Emergency notifications</li>
                  <li>• Schedule changes</li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Stops:</span>
                    <span className="font-bold">
                      {Object.values(routes).reduce((sum, r) => sum + r.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Avg Stops/Route:</span>
                    <span className="font-bold">
                      {Object.values(routes).length > 0 
                        ? (Object.values(routes).reduce((sum, r) => sum + r.length, 0) / 4).toFixed(1)
                        : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                Complaints & Feedback
                {complaints.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full">
                    {complaints.length}
                  </span>
                )}
              </h2>
            </div>

            {complaints.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No complaints or feedback yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{complaint.user_name}</span>
                          {complaint.route_number && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                              Route {complaint.route_number}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            complaint.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : complaint.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Type: {complaint.complaint_type} • {new Date(complaint.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{complaint.message}</p>
                    
                    <div className="flex gap-2 mt-3">
                      {complaint.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              localDataService.updateComplaintStatus(complaint.id, 'in_progress');
                              loadDashboardData();
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-colors"
                          >
                            Start Investigating
                          </button>
                          <button
                            onClick={() => {
                              localDataService.updateComplaintStatus(complaint.id, 'resolved');
                              loadDashboardData();
                            }}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}
                      {complaint.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            localDataService.updateComplaintStatus(complaint.id, 'resolved');
                            loadDashboardData();
                          }}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
