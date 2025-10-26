# Transport Management System

A comprehensive, real-time transport management system for colleges and universities built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Students
- **Route Selection**: Choose and update assigned bus routes
- **Live Tracking**: Real-time GPS tracking of bus location on Google Maps
- **Notifications**: Receive instant updates from drivers and admin
- **Route Information**: View detailed stop timings and fares
- **Password Management**: Secure password change on first login

### For Drivers
- **GPS Sharing**: Share live location with students on assigned route
- **Route Management**: View assigned route stops and timings
- **Notifications**: Send real-time updates to students on the route
- **Location Control**: Start/stop location sharing with one click

### For Administrators
- **System Overview**: Dashboard with key metrics and statistics
- **Driver Management**: View and manage all drivers and assignments
- **Route Overview**: Complete view of all routes and stops
- **System Broadcasts**: Send notifications to all users
- **Analytics**: Track system usage and activity

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

### Tables
- `users` - Student accounts with route assignments
- `drivers` - Driver accounts with bus and route information
- `admins` - Administrator accounts
- `bus_routes` - Route stops, timings, and fares
- `notifications` - Real-time notification system
- `driver_locations` - GPS location tracking for drivers

## Login Credentials (from Excel files)

### Students
- ID: `1JB` | Password: `new123` (Jayesh)
- ID: `a` | Password: `123456`
- ID: `qwerty` | Password: `123456` (tester)
- ID: `jayesh` | Password: `123456` (hola)

### Drivers
- ID: `umesh` | Password: `1234` (Route 1, Bus: BUS-001)
- ID: `pradeep` | Password: `1234` (Route 2, Bus: KA-01-AB-1234)
- ID: `paramesh` | Password: `1234` (Route 3, Bus: KA-01-AB-5678)
- ID: `chandru` | Password: `1234` (Route 4, Bus: KA-01-AB-9012)
- ID: `driverr` | Password: `1234` (Unassigned)

### Admin
- ID: `adminn` | Password: `1234`

## Imported Data Summary

- **4 Students** imported from database.xlsx
- **5 Drivers** imported from database.xlsx
- **1 Admin** imported from database.xlsx
- **56 Bus Stops** across 4 routes imported from Bus_Routes.xlsx
  - Route 1: 17 stops (Malleshwaram to SJBIT)
  - Route 2: 14 stops (Kadhabagere to SJBIT)
  - Route 3: 13 stops (Rama Krishna Ashrama to BEML)
  - Route 4: 12 stops (BTM Layout to SJBIT)

## Real-time Features

1. **Live Notifications**: Instant updates using Supabase real-time subscriptions
2. **GPS Tracking**: Continuous location updates every few seconds
3. **Location Broadcasting**: Drivers can share location with all route students
4. **Automatic Updates**: Dashboard updates automatically without page refresh

## Security Features

- Row Level Security (RLS) policies on all tables
- Session-based authentication
- Secure password storage
- Role-based access control
- Protected route information

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## System Architecture

### Authentication Flow
1. User selects role (Student/Driver/Admin)
2. Enters credentials
3. System validates against respective table
4. Session created and role-based dashboard displayed

### Real-time Communication
- Supabase real-time subscriptions for notifications
- PostgreSQL triggers for automatic updates
- WebSocket connections for live data sync

### GPS Tracking
- Browser Geolocation API for position tracking
- Continuous position updates while sharing is active
- Google Maps integration for visualization
- Real-time coordinate broadcasting to students

## Browser Compatibility

- Modern browsers with Geolocation API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- GPS tracking requires HTTPS in production
- Location permission must be granted by driver
- Real-time features require active internet connection
- First-time student users must change password
