import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegistrarGerente() {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', correo: '', password: '',numero_telefonico: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // 🔹 Comprobación de permisos
  useEffect(() => {
    if (user && !["ADMIN"].includes((user.rol || "").toUpperCase())) {
      navigate('/not-authorized');
    }
  }, [user, navigate]);

  // 🔹 Validar sucursal asignada
  useEffect(() => {
    if (user && !user.sucursal_id) {
      setErr('No se pudo determinar la sucursal asignada. Intenta recargar la página.');
    }
  }, [user]);

  if (!user) return null; // loading...

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setMsg('');

    if (!user?.sucursal_id) {
      setErr('No se pudo determinar la sucursal asignada.');
      return;
    }

    try {
      await api.post('/crear-empleado', {
        ...form,
        rol: "GERENTE",
        sucursal_id: user.sucursal_id,
      });

      setMsg('¡Cuenta creada! Revisa tu correo y confirma para iniciar sesión.');
      navigate('/seleccionar-sucursal', { state: { correoPendiente: form.correo } });
      setForm({ nombre: '', correo: '', password: '', numero_telefonico: '' });
    } catch (e) {
      const msg = e.response?.data?.error || 'No se pudo registrar';
      console.error(e);
      setErr(msg);
    }
  };

  return (
    <div className="registro container mt-4 py-5 col-md-5">
      <h3 className="mb-4 text-center">Crear Gerente</h3>

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
        <input
          type="number"
          className="form-control mb-3"
          name="numero_telefonico"
          placeholder="Numero Telefonico"
          value={form.numero_telefonico}
          onChange={handle}
          required
        />
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
        <button className="btn-registro-gerente btn w-100" type="submit">
          Registrar
        </button>
      </form>
    </div>
  );
}