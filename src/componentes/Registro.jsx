import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Handler para capturar inputs
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setMsg('');

    // Validar que user y sucursal_id estén definidos antes de enviar
    if (!user || !user.sucursal_id) {
      setErr('No se pudo determinar la sucursal asignada. Intenta recargar la página.');
      return;
    }

    try {
      await api.post('/crear-empleado', {
        nombre: form.nombre,
        correo: form.correo,
        password: form.password,
        sucursal_id: user.sucursal_id, // Asignación automática de sucursal
      });

      setMsg('¡Cuenta creada! Revisa tu correo y confirma para iniciar sesión.');
      setForm({ nombre: '', correo: '', password: '' });

      navigate('/seleccionar-sucursal', { state: { correoPendiente: form.correo } });
    } catch (e) {
      const msg = e.response?.data?.error || 'No se pudo registrar';
      console.error(e);
      setErr(msg);
    }
  };

  return (
    <div className="registro container py-5 col-md-5">
      <h3 className="mb-4 text-center">Crear cuenta</h3>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <form className="formulario-registro" onSubmit={submit}>
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

        {/* Ya no hay selector de sucursal */}

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

        <button className="btn-registro btn btn-primary w-100" type="submit">
          Registrarme
        </button>
      </form>
    </div>
  );
}