import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EditarCorreo from './EditarCorreo';  // la tienes en otro archivo

export default function PerfilEditable() {
  const { user, api } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    rol: '',
    estado_usuario: '',
    is_verified: false,
    sucursal_id: '',
  });

  // Estados para mensajes generales de perfil
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || '',
        rol: user.rol || '',
        estado_usuario: user.estado_usuario || '',
        is_verified: !!user.is_verified,
        sucursal_id: user.sucursal_id || '',
      });
    }
  }, [user]);

  // Manejo del cambio de inputs (excepto correo)
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios (sin correo)
  const handleSave = async e => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api.put('/users/perfil', {
        nombre: form.nombre,
        // otros campos que quieras permitir editar
      });
      setMsg('Perfil actualizado correctamente.');
      setEditMode(false);
      // Opcional: refrescar usuario en contexto
    } catch (error) {
      setErr(error.response?.data?.error || 'Error al actualizar perfil.');
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="componente-perfil container p-4 my-4 align-items-center" style={{ maxWidth: '700px' }}>
      <h2>Mi Perfil</h2>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      {!editMode ? (
        <>
          <div className="card mt-3 p-3">
            <p><strong>Nombre:</strong> {form.nombre}</p>
            <p><strong>Correo:</strong> {user.correo}</p>
            <p><strong>Rol:</strong> {form.rol}</p>
            <p><strong>Estado:</strong> {form.estado_usuario}</p>
            <p><strong>Verificado:</strong> {form.is_verified ? 'Sí' : 'No'}</p>
            <p><strong>Sucursal:</strong> {form.sucursal_id}</p>

            <button className="btn-editar-perfil btn btn btn-primary mt-3" onClick={() => setEditMode(true)}>
              Editar perfil
            </button>
          </div>

          {/* Incluye aquí el componente para cambiar correo */}
          <div className='mb-3'>
            <h2>Cambiar correo electrónico</h2>
            <EditarCorreo/>
          </div>
        </>
      ) : (
        <form className="card mt-3 p-3" onSubmit={handleSave}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label"> <strong> Nombre</strong></label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Puedes poner aquí otros campos editables */}

          <div className='formulario-edicion'>
            <button type="submit" className="btn-editar-nombre btn-success mb-1">Guardar</button>
          <button
            type="button"
            className="btn-cancelar-edicion "
            onClick={() => setEditMode(false)}
          >
            Cancelar
          </button>
          </div>
          
        </form>
      )}
    </div>
  );
}