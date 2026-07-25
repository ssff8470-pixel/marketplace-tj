import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, loadToken } from '../api/client';

interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch {
          await setToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (token: string, userData: User) => {
    await setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
