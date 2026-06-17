import { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (user) => user ? { ...user, id: user._id || user.id } : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ea_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const data = await apiGetMe(token);
          setUser(normalizeUser(data.user));
        } catch (err) {
          const msg = err.message || '';
          // Only clear the token for auth failures (401 / invalid token).
          // For server errors (503 cold-start, 502, network) keep the token —
          // the user shouldn't get logged out because the server was sleeping.
          const isAuthError =
            msg.includes('401') ||
            msg.includes('not authorized') ||
            msg.includes('token') ||
            msg.includes('Invalid credentials') ||
            msg.includes('unauthorized');

          if (isAuthError) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('ea_token');
          }
          // For all other errors (cold start, network blip) — stay logged in,
          // user will see their cached state and next action will retry.
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []); // run once on mount only — token is stable from localStorage

  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem('ea_token', newToken);
    setToken(newToken);
    setUser(normalizeUser(newUser));
  };

  const logout = () => {
    localStorage.removeItem('ea_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
