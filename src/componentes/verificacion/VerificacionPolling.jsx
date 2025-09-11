import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VerificacionPolling({ sessionId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const { api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVerification() {
      try {
        const res = await api.get(`/api/veriff/status/${sessionId}`);
        const verification = res.data.verification;
        const status = verification?.status;
        setStatus(status);
        setLoading(false);

        if (status === 'approved') {
          clearInterval(intervalRef.current);

          // Extraer datos para crear cliente
          const person = verification.person || {};
          const doc = verification.document || {};

          const clienteData = {
            nombre: person.firstName || '',
            apellido: person.lastName ||  '',
            numero_identificacion: doc.number || '1234567', // Asumiendo vendorData es el DNI o similar
            tipo_identificacion: doc.type ? doc.type.toLowerCase() : 'id_card',
            correo: '',        // Agrega otros datos si los tienes
            telefono: '',
            direccion: ''
          };

          // Llamar endpoint para crear cliente
          try {
            await api.post('/users/crear-cliente', clienteData);
            // Luego navega a página confirmación
            navigate('/verificacion-completa');
          } catch (err) {
            console.error("Error creando cliente:", err);
            // Opcional: mostrar mensaje de error o navegar a otra página
          }
        } else if (status === 'declined') {
          clearInterval(intervalRef.current);
          navigate('/verificacion-erronea');
        }
      } catch (error) {
        setLoading(false);
        console.error('Error consultando estado de verificación', error);
      }
    }

    intervalRef.current = setInterval(checkVerification, 3000);
    checkVerification();

    return () => clearInterval(intervalRef.current);
  }, [sessionId, navigate, api]);

  return (
    <div className="container text-center mt-4">
      <h4>Verificando identidad...</h4>
      {loading && <p>Consultando estado actual...</p>}
      {status && <p>Estado actual: <b>{status}</b></p>}
      {!loading && !status && <p>No hay datos de verificación aún.</p>}
    </div>
  );
}