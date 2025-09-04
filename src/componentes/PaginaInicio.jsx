import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function PaginaInicio() {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  async function crearsession(e) {
    e.preventDefault(); // evitas que el formulario recargue la página
    try {
      const response = await api.post('/api/veriff/create-session', {
        userId: user.nombre,
        customerName: nombre,
        customerLastName: apellido,
      });
      const originalUrl = response.data.verification.url;
      const sessionId = response.data.verification.id; // <-- aquí obtienes el sessionId

      // Acortar la URL
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`);
      const shortUrl = res.data;

      // Navegar a la página /qr con la URL corta y sessionId en query
      navigate(`/qr?url=${encodeURIComponent(shortUrl)}&sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error al crear sesión o acortar URL:', error);
    }
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-6 p-6'>
          <form onSubmit={crearsession}>
            <label>
              Nombre:
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Apellido:
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                required
              />
            </label>
            <br />
            <button type="submit">Crear sesión de Veriff</button>
          </form>
        </div>
      </div>
    </div>
  );
}