import * as XLSX from 'xlsx';

export interface User {
  id: string;
  password: string;
  name: string;
  assigned_route: number | null;
  selected_stop_name: string | null;
  selected_stop_time: string | null;
  password_changed: boolean;
  dept: string | null;
  sem: string | null;
  usn: string | null;
}

export interface Driver {
  id: string;
  password: string;
  name: string;
  assigned_route: number | null;
  bus_no: string | null;
  phone: string | null;
}

export interface Admin {
  id: string;
  password: string;
  name: string;
}

export interface BusRoute {
  route_number: number;
  stop_name: string;
  timing: string;
  fare: number;
  stop_order: number;
}

export interface Notification {
  id: string;
  sender_type: 'admin' | 'driver';
  sender_id: string;
  sender_name: string;
  route_number: number | null;
  message: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  user_name: string;
  route_number: number | null;
  complaint_type: 'delay' | 'behavior' | 'safety' | 'other';
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
}

class LocalDataService {
  private users: User[] = [];
  private drivers: Driver[] = [];
  private admins: Admin[] = [];
  private busRoutes: BusRoute[] = [];
  private notifications: Notification[] = [];
  private complaints: Complaint[] = [];

  async loadData() {
    try {
      // Load database.xlsx with cache busting to ensure fresh data
      const timestamp = new Date().getTime();
      const databaseResponse = await fetch(`/database.xlsx?t=${timestamp}`);
      const databaseBuffer = await databaseResponse.arrayBuffer();
      const databaseWorkbook = XLSX.read(databaseBuffer, { type: 'array' });

      // Load users
      if (databaseWorkbook.SheetNames.includes('user')) {
        const userSheet = XLSX.utils.sheet_to_json<any>(databaseWorkbook.Sheets['user']);
        
        // Load any updates from localStorage
        const stored = localStorage.getItem('user_updates') || '{}';
        const updates = JSON.parse(stored);
        
        this.users = userSheet.map(row => {
          const userId = String(row.id || '').trim();
          const userUpdates = updates[userId] || {};
          
          return {
            id: userId,
            password: userUpdates.password || String(row.password || '').trim(),
            name: String(row.name || '').trim(),
            assigned_route: userUpdates.assigned_route !== undefined ? userUpdates.assigned_route : (row.assigned_route ? Number(row.assigned_route) : null),
            selected_stop_name: userUpdates.selected_stop_name || null,
            selected_stop_time: userUpdates.selected_stop_time || null,
            password_changed: userUpdates.password_changed !== undefined ? userUpdates.password_changed : (row.password_changed === true || row.password_changed === 'TRUE' || row.password_changed === 'True'),
            dept: String(row.dept || '').trim() || null,
            sem: String(row.sem || '').trim() || null,
            usn: String(row.usn || '').trim() || null
          };
        });
        
        console.log('✅ Loaded', this.users.length, 'users with localStorage updates');
      }

      // Load drivers
      if (databaseWorkbook.SheetNames.includes('driver')) {
        const driverSheet = XLSX.utils.sheet_to_json<any>(databaseWorkbook.Sheets['driver']);
        const busNumbers = ['', 'KA-03-FC-5354', 'KA 03 FN 4829', 'KA-01-AB-5678', 'KA-01-AB-9012', 'KA-01-AB-3456'];
        
        // Load any driver updates from localStorage
        const stored = localStorage.getItem('driver_updates') || '{}';
        const updates = JSON.parse(stored);
        
        this.drivers = driverSheet.map((row, i) => {
          const driverId = String(row.id || '').trim();
          const driverUpdates = updates[driverId] || {};
          
          return {
            id: driverId,
            password: String(row.password || '').trim(),
            name: String(row.id || '').trim().charAt(0).toUpperCase() + String(row.id || '').trim().slice(1),
            assigned_route: i >= 1 && i <= 4 ? i : null,
            bus_no: i >= 1 && i <= 4 ? busNumbers[i] : null,
            phone: driverUpdates.phone || (row.phone ? String(row.phone).trim() : null)
          };
        });
        
        console.log('✅ Loaded', this.drivers.length, 'drivers with localStorage updates');
      }

      // Load admins
      if (databaseWorkbook.SheetNames.includes('admin')) {
        const adminSheet = XLSX.utils.sheet_to_json<any>(databaseWorkbook.Sheets['admin']);
        this.admins = adminSheet.map(row => ({
          id: String(row.id || '').trim(),
          password: String(row.password || '').trim(),
          name: row.name ? String(row.name).trim() : 'Admin'
        }));
      }

      // Load Bus_Routes.xlsx
      const routesResponse = await fetch('/Bus_Routes.xlsx');
      const routesBuffer = await routesResponse.arrayBuffer();
      const routesWorkbook = XLSX.read(routesBuffer, { type: 'array' });

      const routeSheets = ['route1', 'route2', 'route3', 'route4'];

      for (let i = 0; i < routeSheets.length; i++) {
        const sheetName = routeSheets[i];
        const routeNumber = i + 1;

        if (routesWorkbook.SheetNames.includes(sheetName)) {
          const routeSheet = XLSX.utils.sheet_to_json<any>(routesWorkbook.Sheets[sheetName]);

          routeSheet.forEach((row, j) => {
            const stopName = String(row['Route_1'] || row[`Route_${routeNumber}`] || row.Route || '').trim();
            const timing = String(row['Bus_Timings_1'] || row[`Bus_Timings_${routeNumber}`] || row.Timing || '').trim();
            let fareValue = String(row['Fare_1'] || row[`Fare_${routeNumber}`] || row.Fare || '0');

            fareValue = fareValue.replace(/[Rs,\s]/g, '');
            const fare = parseFloat(fareValue) || 0;

            if (stopName && timing && stopName !== sheetName) {
              this.busRoutes.push({
                route_number: routeNumber,
                stop_name: stopName,
                timing: timing,
                fare: fare,
                stop_order: j + 1
              });
            }
          });
        }
      }

      console.log('✅ Loaded data:', {
        users: this.users.length,
        drivers: this.drivers.length,
        admins: this.admins.length,
        busRoutes: this.busRoutes.length
      });
    } catch (error) {
      console.error('Error loading Excel files:', error);
    }
  }

  // Authentication methods
  async authenticateUser(id: string, password: string, role: 'user' | 'driver' | 'admin') {
    let data = null;

    switch (role) {
      case 'user':
        data = this.users.find(u => u.id === id && u.password === password);
        break;
      case 'driver':
        data = this.drivers.find(d => d.id === id && d.password === password);
        break;
      case 'admin':
        data = this.admins.find(a => a.id === id && a.password === password);
        break;
    }

    return data || null;
  }

  // Auto-detect user type based on credentials
  async authenticateUserAutoDetect(id: string, password: string) {
    // Check admin first
    let data = this.admins.find(a => a.id === id && a.password === password);
    if (data) {
      return { ...data, role: 'admin' as const };
    }

    // Check driver
    data = this.drivers.find(d => d.id === id && d.password === password);
    if (data) {
      return { ...data, role: 'driver' as const };
    }

    // Check user
    data = this.users.find(u => u.id === id && u.password === password);
    if (data) {
      return { ...data, role: 'user' as const };
    }

    return null;
  }

  // User methods
  getUsers() {
    return this.users;
  }

  getUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  updateUserPassword(id: string, newPassword: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.password = newPassword;
      user.password_changed = true;
      
      // Save to localStorage for persistence
      const stored = localStorage.getItem('user_updates') || '{}';
      const updates = JSON.parse(stored);
      updates[id] = { ...updates[id], password: newPassword, password_changed: true };
      localStorage.setItem('user_updates', JSON.stringify(updates));
      
      console.log('✅ Password changed for user:', id);
      return true;
    }
    return false;
  }

  updateUserRoute(id: string, routeNumber: number | null, stopName?: string, stopTime?: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.assigned_route = routeNumber;
      if (stopName) user.selected_stop_name = stopName;
      if (stopTime) user.selected_stop_time = stopTime;
      
      // Save to localStorage for persistence
      const stored = localStorage.getItem('user_updates') || '{}';
      const updates = JSON.parse(stored);
      updates[id] = { 
        ...updates[id], 
        assigned_route: routeNumber,
        selected_stop_name: stopName,
        selected_stop_time: stopTime
      };
      localStorage.setItem('user_updates', JSON.stringify(updates));
      
      console.log('✅ Route updated for user:', id, 'Route:', routeNumber);
      return true;
    }
    return false;
  }

  // Driver methods
  getDrivers() {
    return this.drivers;
  }

  getDriverById(id: string) {
    return this.drivers.find(d => d.id === id);
  }

  getDriverByRoute(routeNumber: number) {
    return this.drivers.find(d => d.assigned_route === routeNumber);
  }

  updateDriverPhone(id: string, phone: string) {
    const driver = this.drivers.find(d => d.id === id);
    if (driver) {
      driver.phone = phone;
      
      // Save to localStorage for persistence
      const stored = localStorage.getItem('driver_updates') || '{}';
      const updates = JSON.parse(stored);
      updates[id] = { ...updates[id], phone: phone };
      localStorage.setItem('driver_updates', JSON.stringify(updates));
      
      console.log('✅ Phone updated for driver:', id);
      return true;
    }
    return false;
  }

  // Admin methods
  getAdmins() {
    return this.admins;
  }

  // Bus route methods
  getBusRoutes() {
    return this.busRoutes;
  }

  getRouteStops(routeNumber: number) {
    // Remove duplicates by creating a Map with unique keys
    const stopsMap = new Map<string, BusRoute>();
    
    this.busRoutes
      .filter(r => r.route_number === routeNumber)
      .forEach(stop => {
        const uniqueKey = `${stop.route_number}-${stop.stop_order}`;
        if (!stopsMap.has(uniqueKey)) {
          stopsMap.set(uniqueKey, stop);
        }
      });
    
    return Array.from(stopsMap.values()).sort((a, b) => a.stop_order - b.stop_order);
  }

  getAllRoutes() {
    const routes: { [key: number]: BusRoute[] } = {};
    
    // Remove duplicates using Map
    const routeMaps: { [key: number]: Map<string, BusRoute> } = {};
    
    this.busRoutes.forEach(route => {
      if (!routeMaps[route.route_number]) {
        routeMaps[route.route_number] = new Map();
      }
      const uniqueKey = `${route.route_number}-${route.stop_order}`;
      if (!routeMaps[route.route_number].has(uniqueKey)) {
        routeMaps[route.route_number].set(uniqueKey, route);
      }
    });
    
    // Convert Maps to arrays and sort
    Object.keys(routeMaps).forEach(key => {
      const routeNum = Number(key);
      routes[routeNum] = Array.from(routeMaps[routeNum].values())
        .sort((a, b) => a.stop_order - b.stop_order);
    });
    
    return routes;
  }

  getAllStops() {
    // Get all stops from all routes, sorted by route number and stop order
    const stopsMap = new Map<string, BusRoute>();
    
    this.busRoutes.forEach(stop => {
      const uniqueKey = `${stop.route_number}-${stop.stop_order}`;
      if (!stopsMap.has(uniqueKey)) {
        stopsMap.set(uniqueKey, stop);
      }
    });
    
    return Array.from(stopsMap.values())
      .sort((a, b) => {
        // First sort by route number, then by stop order
        if (a.route_number !== b.route_number) {
          return a.route_number - b.route_number;
        }
        return a.stop_order - b.stop_order;
      });
  }

  // Method to reload data from Excel files
  async reloadData() {
    console.log('🔄 Reloading data from Excel files...');
    await this.loadData();
    console.log('✅ Data reloaded successfully');
  }

  // Notification methods
  addNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random(),
      created_at: new Date().toISOString()
    };
    
    // Load existing notifications from localStorage
    const stored = localStorage.getItem('transport_notifications');
    const existingNotifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    // Add new notification
    existingNotifications.unshift(newNotification);
    
    // Save to localStorage
    localStorage.setItem('transport_notifications', JSON.stringify(existingNotifications));
    
    // Update memory
    this.notifications = existingNotifications;
    
    console.log('✅ Notification added:', newNotification);
    console.log('📋 Total notifications:', this.notifications.length);
    return newNotification;
  }

  getNotifications(routeNumber?: number | null) {
    // Load from localStorage to get latest notifications
    const stored = localStorage.getItem('transport_notifications');
    this.notifications = stored ? JSON.parse(stored) : [];
    
    console.log('🔍 Getting notifications for route:', routeNumber);
    console.log('📋 Available notifications:', this.notifications.length);
    
    if (routeNumber) {
      const filtered = this.notifications.filter(
        n => n.route_number === null || n.route_number === routeNumber
      );
      console.log('✅ Filtered notifications for route', routeNumber, ':', filtered.length);
      return filtered;
    }
    return this.notifications;
  }

  getRecentNotifications(limit: number = 10) {
    // Load from localStorage
    const stored = localStorage.getItem('transport_notifications');
    this.notifications = stored ? JSON.parse(stored) : [];
    return this.notifications.slice(0, limit);
  }

  clearAllNotifications() {
    this.notifications = [];
    localStorage.removeItem('transport_notifications');
    console.log('🗑️ All notifications cleared');
  }

  // Complaint/Feedback methods
  addComplaint(complaint: Omit<Complaint, 'id' | 'created_at'>) {
    const newComplaint: Complaint = {
      ...complaint,
      id: Date.now().toString() + Math.random(),
      created_at: new Date().toISOString()
    };
    
    this.complaints.push(newComplaint);
    
    // Save to localStorage for persistence
    localStorage.setItem('transport_complaints', JSON.stringify(this.complaints));
    
    console.log('📝 Complaint added by:', complaint.user_name);
    return newComplaint;
  }

  getComplaints() {
    // Load from localStorage to get latest complaints
    const stored = localStorage.getItem('transport_complaints');
    this.complaints = stored ? JSON.parse(stored) : [];
    
    // Sort by date (newest first)
    return this.complaints.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getComplaintsByRoute(routeNumber: number) {
    const stored = localStorage.getItem('transport_complaints');
    this.complaints = stored ? JSON.parse(stored) : [];
    
    return this.complaints
      .filter(c => c.route_number === routeNumber)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  updateComplaintStatus(id: string, status: 'pending' | 'in_progress' | 'resolved') {
    const stored = localStorage.getItem('transport_complaints');
    this.complaints = stored ? JSON.parse(stored) : [];
    
    const complaint = this.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = status;
      localStorage.setItem('transport_complaints', JSON.stringify(this.complaints));
      console.log('✅ Complaint status updated:', id, 'to', status);
      return true;
    }
    return false;
  }
}

export const localDataService = new LocalDataService();

