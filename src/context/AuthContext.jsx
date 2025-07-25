import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  /* 1️⃣ Instancia única de Axios */
  const api = useMemo(() => {
    const inst = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: false            // solo header, sin cookies
    });
    inst.interceptors.request.use(cfg => {
      const t = sessionStorage.getItem('token');   // siempre la versión actual
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });
    return inst;
  }, []);

  /* 2️⃣ Login */
  const login = async creds => {
    const { data } = await api.post('/auth/login', creds);

    // guarda el JWT una sola vez
    sessionStorage.setItem('token', data.access_token);
    setToken(data.access_token);

    // header inmediato para las llamadas siguientes
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

    // carga el perfil antes de redirigir
    const me = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(me);
    setUser(me.data);

    navigate('/pagina-inicio');                       // o '/landing'
  };

  /* 3️⃣ Hidrata el usuario al refrescar la SPA */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log('Nuevo token:', token);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (!token) return;                  // sin token, nada que hacer
    api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => setUser(r.data))
      .catch(() => {                    // token vencido o inválido
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      });
  }, [token]);                           // api es estable, no hace falta listarla

  return (
    <AuthContext.Provider value={{ user, token, login, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);