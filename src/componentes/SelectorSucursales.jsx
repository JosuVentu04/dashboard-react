import React, { useEffect, useState } from 'react';
import { useSucursal } from '../context/SucursalContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/LogoMarcel1.jpeg';


export default function SelectorSucursal() {
  const [sucursales, setSucursales] = useState([]);
  const { setSucursal } = useSucursal();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://192.168.1.122:5000/sucursales')
      .then(res => res.json())
      .then(data => setSucursales(data))
      .catch(() => setError('Error cargando sucursales'));
  }, []);

  const seleccionarSucursal = (s) => {
    setSucursal(s);
    navigate(`/sucursales/${s.id}/login`);
  };

  return (
    <div className="container text-center py-5">
      <div className='row'>
        <div className='col-3'></div>
        <div className='formulario-sucursales col-6'>
          <h2 className='mb-4 '>Selecciona tu sucursal</h2>
          <img className='mb-3 img-selector-sucursal' src={logo} alt="" />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <ul className='sucursales-opciones'>
            {sucursales.map(s => (
              <li key={s.id}>
                <button className='boton-opcion-sucursales' onClick={() => seleccionarSucursal(s)}>{s.nombre} {s.id}</button>
              </li>
            ))}
          </ul>
          {sucursales.length === 0 && !error && <p>Cargando sucursales...</p>}
        </div>
      </div>
    </div>
  );
}