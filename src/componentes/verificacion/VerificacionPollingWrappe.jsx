import { useLocation } from 'react-router-dom';
import VerificacionPolling from './VerificacionPolling';

export default function VerificacionPollingWrapper() {
  const query = new URLSearchParams(useLocation().search);
  const sessionId = query.get('sessionId');

  return (
    <div>
      {sessionId ? (
        <VerificacionPolling sessionId={sessionId} />
      ) : (
        <p>No hay sesión de Veriff para verificar.</p>
      )}
    </div>
  );
}