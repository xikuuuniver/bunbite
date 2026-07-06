import { createContext, useContext, useState, ReactNode } from 'react';

export interface AuthUser {
  username: string;
  firstName?: string;
  lastName?: string;
  avatar: string | null; // base64 data URL or null
}

interface AuthContextValue {
  user: AuthUser | null;
  login:  (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
