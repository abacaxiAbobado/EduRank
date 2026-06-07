import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/users/me')
      .then((r) => {
        setUser(r.data);
        localStorage.setItem('user', JSON.stringify(r.data));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function login(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  function refreshUser() {
    return api.get('/users/me').then((r) => {
      setUser(r.data);
      localStorage.setItem('user', JSON.stringify(r.data));
      return r.data;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
