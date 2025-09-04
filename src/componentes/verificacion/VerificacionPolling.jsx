import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Recibe sessionId como prop
export default function VerificacionPolling({ sessionId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const { api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVerification() {
      try {
        // Cambia esta URL por la de tu backend Flask
        const res = await api.get(`/api/veriff/status/${sessionId}`);
        const verificacion = res.data.verifications && res.data.verifications[0];
        setStatus(verificacion?.status);
        setLoading(false);
        // Ejemplo: 'approved' es verificado exitoso según Veriff [web:54]
        if (verificacion?.status === 'approved') {
            clearInterval(intervalRef.current);
             navigate('/verificacion-completa');
     }
        // Puedes manejar estados como 'declined', 'expired', etc. aquí también
      } catch (error) {
        setLoading(false);
        console.error('Error consultando estado de verificación', error);
      }
    }

    // Poll cada 3 segundos
    intervalRef.current = setInterval(checkVerification, 3000);
    checkVerification(); // Llama una vez al montar

    return () => clearInterval(intervalRef.current);
  }, [sessionId, navigate]);

  return (
    <div className="container text-center mt-4">
      <h4>Verificando identidad...</h4>
      {loading && <p>Consultando estado actual...</p>}
      {status && <p>Estado actual: <b>{status}</b></p>}
      {!loading && !status && <p>No hay datos de verificación aún.</p>}
    </div>
  );
}