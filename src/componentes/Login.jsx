import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/LogoMarcel1.jpeg';
import { useSucursal } from '../context/SucursalContext';

export default function Login() {
  const { sucursal, setSucursal } = useSucursal() || {};
  const { login, api } = useAuth();              // api lo usamos para reenviar
  const { state } = useLocation();            // trae correoPendiente
  const [form, setForm] = useState({
    correo: state?.correoPendiente || '',
    password: ''
  });

  const [err, setErr] = useState('');
  const [pend, setPend] = useState(false);     // cuenta no verificada
  const [msg, setMsg] = useState('');        // aviso al reenviar

  /* ---------- handlers ---------- */
  const handle = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (creds) => {
    await login(creds);        // tu función de login del contexto
    Navigate(from, { replace: true });
  }

  const submit = async e => {
    e.preventDefault();
    setErr(''); setPend(false); setMsg('');
    try {
      await login({ correo: form.correo, password: form.password, sucursal_id: sucursal?.id });                       // ③ redirige al éxito
    } catch (e) {
      if (e.response?.status === 403) {
        setPend(true);
      if (!sucursal) {
        setErr('Por favor selecciona una sucursal primero.');
        return;
        }                      // cuenta sin verificar
      } else {
        setErr(e.response?.data?.msg || 'Credenciales inválidas');
      }
    }
  };
  const reenviar = async () => {
    setMsg(''); setErr('');
    try {
      await api.post('/auth/enviar-verificacion', { correo: form.correo });
      setMsg('Te hemos enviado un nuevo enlace de verificación.');
    } catch (e) {
      setErr('No se pudo reenviar el correo.');
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="container py-5 col-md-4">
      <h3 className="mb-4 text-center">Iniciar sesión</h3>
      <img className='logo-login mb-3 text-center' src={logo} alt="" />

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* aviso de cuenta no verificada */}
      {pend && (
        <div className="alert alert-warning">
          Tu cuenta aún no está verificada.
          <button onClick={reenviar} className="btn btn-link p-0 ms-2">
            Reenviar correo
          </button>
        </div>
      )}

      <form onSubmit={submit}>
        <input
          type="email"
          className="formulario-login form-control mb-3"
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handle}
          required
        />

        <input
          type="password"
          className="formulario-login form-control mb-4"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handle}
          required
        />

        <button className="btn-login btn text-black w-100">Entrar</button>
      </form>

      {/* <p className="mt-3 text-center">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p> */}
    </div>
  );
}