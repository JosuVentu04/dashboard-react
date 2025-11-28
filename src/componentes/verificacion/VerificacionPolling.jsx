import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDatosUsuario } from '../../context/DatosUsuarioContext';

export default function VerificacionPolling({ sessionId, empleadoId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState(null);
  const intervalRef = useRef(null);
  const { datosUsuario } = useDatosUsuario();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVerification() {
      try {
        const res = await api.get(`/api/veriff/status/${sessionId}`);
        const verification = res.data.verification;
        const currentStatus = verification?.status;
        setStatus(currentStatus);
        setLoading(false);

        if (currentStatus === 'approved' || currentStatus === 'declined') {
          localStorage.removeItem('UrlActual');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('sessionIdActual');
          clearInterval(intervalRef.current);

          const person = verification?.person || {};
          const doc = verification?.document || {};
          const motivo = verification?.reason || '';

          if (currentStatus === 'approved') {
            const clienteData = {
              primer_nombre: person.firstName || '',
              apellido_paterno: person.lastName || '',
              numero_identificacion: doc.number || '123456723',
              tipo_identificacion: doc.type ? doc.type.toLowerCase() : 'id_card',
              numero_telefonico: datosUsuario?.telefono || '',
              direccion: ''
            };

            try {
              await api.post('/users/crear-cliente', clienteData);

              const clientes = await api.get('/users/clientes');
              console.log('Clientes existentes:', clientes.data);
              const clienteFiltrado = clientes.data.find(
                c => c.primer_nombre === person.firstName && c.apellido_paterno === person.lastName
              );
              console.log('Cliente filtrado:', clienteFiltrado);
              localStorage.setItem('DatosUsuario', JSON.stringify({ clienteFiltrado }));
              const clienteIdNuevo = clienteFiltrado?.id || null;
              setClienteId(clienteIdNuevo);
              console.log('ID del cliente creado o encontrado:', clienteIdNuevo);

              const consultaData = {
                primer_nombre: clienteFiltrado.primer_nombre || '',
                apellido_paterno: clienteFiltrado.apellido_paterno || '',
                empleado_id: user?.id || empleadoId,
                usuario_id: clienteIdNuevo|| '7',
                session_id: sessionId,
                motivo_consulta: motivo,
                resultado_consulta: currentStatus,
              };
              await api.post('/api/veriff/guardar-consulta', consultaData);

              navigate('/verificacion-completa');
            } catch (err) {
              console.error('Error creando cliente o guardando consulta:', err);
            }
          } else {
            
              const usuarioEspecialId = 9999;  // O el ID que definiste para "usuario no aprobado"
  
              const consultaData = {
                primer_nombre: person.firstName || '',
                apellido_paterno: person.lastName || '',
                empleado_id: user?.id || empleadoId,
                usuario_id: usuarioEspecialId,   // Aquí asignas el usuario especial para declinados
                session_id: sessionId,
                motivo_consulta: motivo,
                resultado_consulta: currentStatus,
              };
              try {
                await api.post('/api/veriff/guardar-consulta', consultaData);
                } catch (err) {
                  console.error('Error guardando consulta:', err);
                }

              navigate('/verificacion-erronea');
            }
        }
      } catch (error) {
        setLoading(false);
        console.error('Error consultando estado de verificación', error);
      }
    }

    intervalRef.current = setInterval(checkVerification, 3000);
    checkVerification();
    return () => clearInterval(intervalRef.current);
  }, [sessionId, empleadoId, user, api, navigate]);

  return (
    <div className="container text-center mt-4">
      <h4>Verificando identidad...</h4>
      {loading && <p>Consultando estado actual...</p>}
      {status && <p>Estado actual: <b>{status}</b></p>}
      {!loading && !status && <p>No hay datos de verificación aún.</p>}
    </div>
  );
}