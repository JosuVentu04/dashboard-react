import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RetomarVerificacion() {
  const [sessionIdGuardado, setSessionIdGuardado] = useState(null);
  const [estadoVerificacion, setEstadoVerificacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const sesion = localStorage.getItem('sessionIdActual');
    if (sesion) {
      setSessionIdGuardado(sesion);
      fetch(`${API_URL}/api/veriff/status/${sesion}`)
        .then(res => res.json())
        .then(data => {
          const status = data.verification?.status;
          if (!status || (status !== 'approved' && status !== 'declined')) {
            setEstadoVerificacion('pending');
          } else {
            setEstadoVerificacion(status);
          }
          setCargando(false);
        })
        .catch(err => {
          console.error("Error al obtener verificación:", err);
          setEstadoVerificacion(null);
          setCargando(false);
        });
    } else {
      setEstadoVerificacion(null);
      setCargando(false);
    }
  }, []);

  const retomarVerificacion = async () => {
    const UrlActual = localStorage.getItem('UrlActual');
    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(UrlActual)}`);
      const shortUrl = res.data;
      navigate(`/qr?url=${encodeURIComponent(shortUrl)}&sessionId=${sessionIdGuardado}`);
    } catch (error) {
      console.error('Error al acortar URL:', error);
    }
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div className='retomar-verificacion text-center'>
      {estadoVerificacion === 'pending' && sessionIdGuardado ? (
        <button className="retomar-verificacion-button" onClick={retomarVerificacion}>
          Retomar verificación pendiente
        </button>
      ) : (
        <p>No hay verificaciones pendientes por el momento</p>
      )}
    </div>
  );
}
