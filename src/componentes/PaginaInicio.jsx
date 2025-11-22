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

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [errorPago, setErrorPago] = useState('');

  // ---------------------------------------------------------
  // INICIAR PROCESO DE VENTA
  // ---------------------------------------------------------
  async function crearsession(e) {
    e.preventDefault();
    try {
      const response = await api.post('/api/veriff/create-session', {
        userId: user.nombre,
        customerName: nombre,
        customerLastName: apellido,
      });

      const originalUrl = response.data.verification.url;
      localStorage.setItem('UrlActual', originalUrl);
      const sessionId = response.data.verification.id;

      setDatosUsuario({ nombre, apellido });

      localStorage.setItem('DatosEmpleado', JSON.stringify(user));

      const res = await axios.get(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`
      );

      const shortUrl = res.data;
      navigate(`/qr?url=${encodeURIComponent(shortUrl)}&sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error al crear sesión o acortar URL:', error);
    }
  }

  // ---------------------------------------------------------
  // BUSCAR CLIENTE CON ADEUDO
  // ---------------------------------------------------------
  async function buscarCliente(e) {
    e.preventDefault();
    setErrorPago('');

    if (!busqueda.trim()) {
      setErrorPago("Ingresa un código o número telefónico");
      return;
    }

    try {
  let response;

  if (busqueda.startsWith("MP-")) {
    response = await api.get(`/users/saldo/${busqueda}`);
  } else {
    response = await api.get(`/users/buscar?telefono=${busqueda}`);
  }

  const cliente = response.data;

  // Aquí agregas el console.log para ver el resultado completo:
  console.log('Cliente recibido:', cliente);

if (!cliente.saldos || cliente.saldos.length === 0) {
  setErrorPago("El usuario no tiene contratos activos.");
  return;
}
  navigate(`/pagos?codigo=${cliente.codigo}`);

} catch (err) {
  console.log(err);
  setErrorPago("Cliente no encontrado o no tiene adeudos.");
}
  }

  return (
    <div className='container'>
      <div className='row'>

        {/* INICIAR VENTA */}

        <div className='col-6 p-6'>
          <form className="formulario-registo-usuario" onSubmit={crearsession}>
            <h3 className="text-center">Iniciar Venta</h3>

            <img className='logo-crear-sesion mb-3' src={logo} alt="logo" />

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Apellido"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              required
            />

            <button className='btn-subir-sesion' type="submit">
              Iniciar proceso de venta
            </button>
          </form>
        </div>

        {/* REALIZAR PAGO */}

        <div className='col-6 p-6'>
          <form className="formulario-registo-usuario" onSubmit={buscarCliente}>
            <h3 className="text-center">Realizar Pago</h3>

            <img className='logo-crear-sesion mb-3' src={logo} alt="logo" />

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Código (MP-XXXXX) o Teléfono"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              required
            />

            {/* Campo invisible pero mantiene espacio */}

            <input
              type="text"
              className="form-control mb-3 invisible-input"
              disabled
            />

            {errorPago && (
              <p className="text-danger text-center">{errorPago}</p>
            )}

            <button className='btn-subir-sesion' type="submit">
              Buscar cliente
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}