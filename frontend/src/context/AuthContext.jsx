import { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (user) => user ? { ...user, id: user._id || user.id } : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ea_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const data = await apiGetMe(token);
          setUser(normalizeUser(data.user));
        } catch {
          // Token expired or invalid — clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem('ea_token');
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, [token]);

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
