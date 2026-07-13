import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);
const SESSION_KEY = 'pgi_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) { setLoading(false); return; }
      const session = JSON.parse(saved);
      if (!session.token || !session.user) { localStorage.removeItem(SESSION_KEY); setLoading(false); return; }
      if (session.expiresAt && Date.now() > session.expiresAt) { localStorage.removeItem(SESSION_KEY); setLoading(false); return; }
      setUser(session.user);
      setToken(session.token);
      // Validate token against backend; refresh user role
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${session.token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(u => { if (cancelled) return; const updated = { ...session.user, ...u }; setUser(updated); localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, user: updated })); })
        .catch(() => { if (!cancelled) { localStorage.removeItem(SESSION_KEY); setUser(null); setToken(null); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    } catch { localStorage.removeItem(SESSION_KEY); setLoading(false); }
  }, []);

  const login = (userData, userToken) => {
    const session = { user: userData, token: userToken, loginAt: Date.now(), expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null); setToken(null); window.location.href = '/login'; };

  const updateUser = (newData) => {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    session.user = { ...session.user, ...newData };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session.user);
  };

  const api = async (url, options = {}) => {
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    let data;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) { data = await res.json(); } else { const text = await res.text(); try { data = JSON.parse(text); } catch { data = { error: text.substring(0, 200) }; } }
    if (res.status === 401 || res.status === 403) throw new Error(data.error || 'Sesi habis');
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api, updateUser, isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN', isSeller: ['SELLER', 'ADMIN', 'SUPERADMIN'].includes(user?.role) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
