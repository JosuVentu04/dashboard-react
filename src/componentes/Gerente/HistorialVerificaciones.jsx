import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function HistorialVerificaciones() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    async function fetchHistorial() {
      try {
        const res = await api.get('/api/veriff/historial-consultas');
        setHistorial(res.data);
      } catch (error) {
        console.error('Error obteniendo historial de verificaciones', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistorial();
  }, [api]);

  return (
    <div className="container mt-4">
      <h3>Historial de verificaciones</h3>
      {loading ? (
        <p>Cargando historial...</p>
      ) : historial.length === 0 ? (
        <p>No hay verificaciones registradas.</p>
      ) : (
        <table className="table table-bordered table-striped mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Motivo</th>
              <th>Resultado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.empleado_id}</td>
                <td>{item.usuario_id}</td>
                <td>{item.nombre}</td>
                <td>{item.apellido}</td>
                <td>{item.motivo_consulta}</td>
                <td><b>{item.resultado_consulta}</b></td>
                <td>{item.fecha_consulta ? new Date(item.fecha_consulta).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}