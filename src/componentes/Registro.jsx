import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';   // ← 1) aquí
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { api } = useAuth();
  const navigate = useNavigate();  

  /* ---------- estado ---------- */
  const [form, setForm] = useState({
    nombre: '', correo: '', password: '', sucursal_id: ''
  });
  const [sucursales, setSucursales] = useState([]);     // ← lista de sucursales
  const [msg, setMsg]  = useState('');
  const [err, setErr]  = useState('');

  /* ---------- obtener sucursales al montar ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/sucursales');
        // filtra solo las que estén activas (o el criterio que uses)
        const disponibles = data.filter(s => s.estado_sucursal === 'ACTIVA');
        setSucursales(disponibles);
      } catch (e) {
        console.error('Error al cargar sucursales', e);
        setSucursales([]);
      }
    })();
  }, []);

  /* ---------- handlers ---------- */
  const handle = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.post('/crear-empleado', {
        nombre:      form.nombre,
        correo:      form.correo,
        password:    form.password,
        sucursal_id: form.sucursal_id      // se envía tal cual
        
      });
      setMsg('¡Cuenta creada! Revisa tu correo y confirma para iniciar sesión.');
      setForm({ nombre: '', correo: '', password: '', sucursal_id: '' });
      navigate('/login', { state: { correoPendiente: form.correo } });
    } catch (e) {
      const msg = e.response?.data?.error || 'No se pudo registrar';
      console.log(e);
      setErr(msg);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="registro container py-5 col-md-5">
      <h3 className="mb-4 text-center">Crear cuenta</h3>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <form className='formulario-registro' onSubmit={submit}>
        <input
          className="form-control mb-3"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handle}
          required
        />

        <input
          type="email"
          className="form-control mb-3"
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handle}
          required
        />

        {/* selector de sucursal */}
        <select
          className=" form-select mb-3"
          name="sucursal_id"
          value={form.sucursal_id}
          onChange={handle}
          required
        >
          <option value="">Selecciona una sucursal...</option>
          {sucursales.map(s => (
            <option className='opcion-sucursales' key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <input
          type="password"
          className="form-control mb-4"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handle}
          required
          minLength={6}
        />

        <button className="btn-registro btn btn-primary w-100">Registrarme</button>
      </form>
    </div> 
  );
}
