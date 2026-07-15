import { createContext, useContext, useState, ReactNode } from 'react';

export interface AuthUser {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar: string | null; // base64 data URL or null
}

interface AuthContextValue {
  user: AuthUser | null;
  login:  (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* Key used to persist a "remembered" session across visits/refreshes.
   Absence of this key means the visitor has never logged in (or logged out),
   so they must always start logged out. */
const SESSION_STORAGE_KEY = 'bunbite.session';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Only restore a user if there's a previously remembered session in storage.
  // First-time visitors (no stored session) always start logged out.
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      /* storage unavailable (e.g. private mode) -- session just won't persist */
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
