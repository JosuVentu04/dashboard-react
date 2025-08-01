import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function EditarCorreo() {
  const { api, user } = useAuth();
  const [nuevoCorreo, setNuevoCorreo] = useState(user?.correo || '');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setErr('');

    try {
      await api.post('/users/solicitar-cambio-correo', { nuevo_correo: nuevoCorreo },);
      setMsg('Se enviaron correos de verificación a ambas direcciones. Por favor confirma ambos.');
    } catch (error) {
      setErr(error.response?.data?.error || 'Error al solicitar cambio');
    }
  };

  return (
    <form className='my-4 p-3 card d-flex' onSubmit={handleSubmit}>
      <label className='mb-3'> <strong>Correo actual:</strong> {user?.correo}</label>
      <div>
        <label htmlFor="nombre" className="label-nuevo-correo mb-3 form-label"><strong>Nuevo correo: </strong> </label>
        <div className='text-center'>
          <input
          className='mb-3 input-nuevo-correo form-control'
          type="email"
          value={nuevoCorreo}
          onChange={e => setNuevoCorreo(e.target.value)}
          required
        />
        </div>
      <button className='btn btn btn-primary w-100 btn-solicitar-nuevo-correo' type="submit">Solicitar cambio de correo</button>

      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
      </div>
    </form>
  );
}