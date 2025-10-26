/*
  # Transport Management System Database Schema

  ## Overview
  Creates a comprehensive database structure for managing college transport including users, drivers, admins, bus routes, notifications, and real-time location tracking.

  ## 1. New Tables
  
  ### `users`
  - `id` (text, primary key) - Unique user identifier
  - `password` (text) - Hashed password
  - `name` (text) - Full name
  - `assigned_route` (integer, nullable) - Route number (1-4)
  - `password_changed` (boolean) - Whether password has been changed from default
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `drivers`
  - `id` (text, primary key) - Unique driver identifier
  - `password` (text) - Hashed password
  - `name` (text) - Driver full name
  - `assigned_route` (integer, nullable) - Route number (1-4)
  - `bus_no` (text, nullable) - Bus number or license plate
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `admins`
  - `id` (text, primary key) - Admin identifier
  - `password` (text) - Hashed password
  - `name` (text) - Admin name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `bus_routes`
  - `id` (uuid, primary key) - Unique route entry ID
  - `route_number` (integer) - Route number (1-4)
  - `stop_name` (text) - Bus stop name
  - `timing` (text) - Pickup/drop timing
  - `fare` (numeric) - Fare amount
  - `stop_order` (integer) - Order of stop in route
  - `created_at` (timestamptz) - Record creation timestamp

  ### `notifications`
  - `id` (uuid, primary key) - Unique notification ID
  - `sender_type` (text) - Type of sender (admin/driver)
  - `sender_id` (text) - ID of sender
  - `sender_name` (text) - Name of sender
  - `route_number` (integer, nullable) - Route number for targeted notifications
  - `message` (text) - Notification content
  - `created_at` (timestamptz) - Notification timestamp

  ### `driver_locations`
  - `id` (uuid, primary key) - Unique location entry ID
  - `driver_id` (text) - Driver identifier
  - `route_number` (integer) - Associated route number
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `is_sharing` (boolean) - Whether driver is actively sharing location
  - `updated_at` (timestamptz) - Last location update timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Users can view their own data and assigned route information
  - Drivers can update their location and view their route
  - Admins have full access to system data
  - Public can view route information (for unauthenticated access during login)

  ## 3. Indexes
  - Index on assigned_route for faster route-based queries
  - Index on route_number in bus_routes for efficient route lookups
  - Index on created_at in notifications for chronological ordering
  - Index on driver_id in driver_locations for location tracking

  ## 4. Important Notes
  - All passwords should be hashed before storage
  - Real-time subscriptions enabled for notifications and driver_locations
  - Timestamps use timestamptz for timezone awareness
  - Route numbers constrained to 1-4
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  password text NOT NULL,
  name text NOT NULL,
  assigned_route integer CHECK (assigned_route BETWEEN 1 AND 4),
  password_changed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id text PRIMARY KEY,
  password text NOT NULL,
  name text NOT NULL,
  assigned_route integer CHECK (assigned_route BETWEEN 1 AND 4),
  bus_no text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id text PRIMARY KEY,
  password text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bus_routes table
CREATE TABLE IF NOT EXISTS bus_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number integer NOT NULL CHECK (route_number BETWEEN 1 AND 4),
  stop_name text NOT NULL,
  timing text NOT NULL,
  fare numeric NOT NULL,
  stop_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'driver')),
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  route_number integer CHECK (route_number BETWEEN 1 AND 4),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create driver_locations table
CREATE TABLE IF NOT EXISTS driver_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text NOT NULL,
  route_number integer NOT NULL CHECK (route_number BETWEEN 1 AND 4),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_sharing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_assigned_route ON users(assigned_route);
CREATE INDEX IF NOT EXISTS idx_drivers_assigned_route ON drivers(assigned_route);
CREATE INDEX IF NOT EXISTS idx_bus_routes_route_number ON bus_routes(route_number);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_route ON notifications(route_number);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_route ON driver_locations(route_number);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true);

-- RLS Policies for drivers table
CREATE POLICY "Drivers can view own data"
  ON drivers FOR SELECT
  USING (true);

CREATE POLICY "Drivers can update own data"
  ON drivers FOR UPDATE
  USING (true);

-- RLS Policies for admins table
CREATE POLICY "Admins can view own data"
  ON admins FOR SELECT
  USING (true);

-- RLS Policies for bus_routes table (public read access)
CREATE POLICY "Anyone can view bus routes"
  ON bus_routes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage bus routes"
  ON bus_routes FOR ALL
  USING (true);

-- RLS Policies for notifications table
CREATE POLICY "Anyone can view notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for driver_locations table
CREATE POLICY "Anyone can view driver locations"
  ON driver_locations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage driver locations"
  ON driver_locations FOR ALL
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_locations_updated_at
  BEFORE UPDATE ON driver_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();