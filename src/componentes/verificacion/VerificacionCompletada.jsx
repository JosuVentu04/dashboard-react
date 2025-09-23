import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerificacionCompletada() {
  const navigate = useNavigate();
  const nombre = "Juan";
  const apellido = "Pérez Gómez";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/firmar-contrato', { state: { nombre, apellido } });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, nombre, apellido]);

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Verificación Completada</h2>
      <p>Gracias por completar el proceso de verificación.</p>
      <p>Tu identidad ha sido verificada exitosamente.</p>
      <p>Serás redirigido al contrato para firmar con huella dactilar...</p>
    </div>
  );
}