import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 1️⃣ Instancia única de Axios */
  const api = useMemo(() => {
    const inst = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: false            // solo header, sin cookies
    });
    inst.interceptors.request.use(cfg => {
      const t = localStorage.getItem('token');   // siempre la versión actual
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });
    return inst;
  }, []);

  /* 2️⃣ Login */
  const login = async creds => {
    const { data } = await api.post('/auth/login', creds);

    // guarda el JWT una sola vez
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token); 

    // header inmediato para las llamadas siguientes
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

    // carga el perfil antes de redirigir
    const me = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${data.access_token}}`
      }
    });
    console.log(me);
    setUser(me.data);

    navigate('/');                       // o '/landing'
  };

  /* 3️⃣ Hidrata el usuario al refrescar la SPA */
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api.get('/auth/me')
       .then(res => setUser(res.data))
       .catch(() => {
         localStorage.removeItem('token');
         setUser(null);
       })
       .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, [token]);                           // api es estable, no hace falta listarla

  return (
    <AuthContext.Provider value={{ user, token, login, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);