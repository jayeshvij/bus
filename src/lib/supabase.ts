import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  password: string;
  name: string;
  assigned_route: number | null;
  password_changed: boolean;
}

export interface Driver {
  id: string;
  password: string;
  name: string;
  assigned_route: number | null;
  bus_no: string | null;
}

export interface Admin {
  id: string;
  password: string;
  name: string;
}

export interface BusRoute {
  id: string;
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

export interface DriverLocation {
  id: string;
  driver_id: string;
  route_number: number;
  latitude: number;
  longitude: number;
  is_sharing: boolean;
  updated_at: string;
}
