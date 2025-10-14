import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import logo from '../assets/LogoMarcel2.png';
import { useDatosUsuario } from '../context/DatosUsuarioContext';

export default function PaginaInicio() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const { datosUsuario, setDatosUsuario } = useDatosUsuario();

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
      localStorage.setItem('UrlActual', originalUrl);
      const sessionId = response.data.verification.id; // <-- aquí obtienes el sessionId
      setDatosUsuario({ nombre, apellido }); // Guardar datos en el contexto
      const datos = { nombre, apellido };
      localStorage.setItem('DatosEmpleado', JSON.stringify(user))
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
          <form className="formulario-registo-usuario" onSubmit={crearsession}>
            <h3 className="text-center">Iniciar Venta</h3>
            <img className='logo-crear-sesion mb-3' src={logo} alt="" />
              <input
                type="text"
                className="form-control mb-3"
                name="nombre"
                placeholder="Nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-control mb-3"
                name="apellido"
                placeholder="Apellido"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                required
              />
            <button className='btn-subir-sesion' type="submit">Iniciar proceso de venta</button>
          </form>
        </div>
      </div>
    </div>
  );
}