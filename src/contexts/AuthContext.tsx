import React, { createContext, useContext, useState, useEffect } from 'react';
import { localDataService } from '../lib/localData';

export type UserRole = 'user' | 'driver' | 'admin';

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  assigned_route?: number | null;
  selected_stop_name?: string | null;
  selected_stop_time?: string | null;
  bus_no?: string | null;
  password_changed?: boolean;
  dept?: string | null;
  sem?: string | null;
  usn?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Excel data on app start
    localDataService.loadData().then(() => {
      const storedUser = localStorage.getItem('transport_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    });
  }, []);

  const login = async (id: string, password: string): Promise<boolean> => {
    try {
      const data = await localDataService.authenticateUserAutoDetect(id, password);

      if (!data) {
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        role: data.role,
        assigned_route: data.assigned_route || null,
        selected_stop_name: (data as any).selected_stop_name || null,
        selected_stop_time: (data as any).selected_stop_time || null,
        bus_no: (data as any).bus_no || null,
        password_changed: (data as any).password_changed !== undefined ? (data as any).password_changed : true,
        dept: (data as any).dept || null,
        sem: (data as any).sem || null,
        usn: (data as any).usn || null
      };

      setUser(authUser);
      localStorage.setItem('transport_user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transport_user');
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('transport_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
