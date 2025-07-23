import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  /* ---------- axios con credenciales ---------- */
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false            // usa cookies = true, JWT = false
  });

  api.interceptors.request.use(cfg => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  /* ----------------- acciones ----------------- */
  const login = async creds => {
    const { data } = await api.post('/auth/login', creds);
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);               // la API puede devolver datos del usuario
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  /* ---------- opcional: validar token  ---------- */
  useEffect(() => {
    if (!token) return;
    api.get('/auth/me')
       .then(r => setUser(r.data))
       .catch(() => logout());
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);