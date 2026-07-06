import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('pgi_auth');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUser(data.user);
        setToken(data.token);
      } catch(e) {}
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('pgi_auth', JSON.stringify({ user: userData, token: userToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pgi_auth');
  };

  const api = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Sesi habis, silakan login ulang');
    }
    return res.json();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api, isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
