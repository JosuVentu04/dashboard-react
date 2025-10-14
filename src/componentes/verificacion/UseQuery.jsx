import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qrcode-logo';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function QRPage() {
  const query = useQuery();
  const veriffUrl = query.get('url');        // URL original de veriff para verificación
  const sessionId = query.get('sessionId');
  // URL personalizada para captura manual (ajusta dominio y path reales)
  const capturaUrl = sessionId ? `http://localhost:3000/captura?sessionId=${sessionId}` : null;
  const navigate = useNavigate();
  localStorage.setItem('sessionIdActual', sessionId);

  const handleStartPolling = () => {
    if (sessionId) {
      navigate(`/polling?sessionId=${sessionId}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>

      {veriffUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3>Escanea el QR oficial de Veriff</h3>
          <a href={veriffUrl} target="_blank" rel="noopener noreferrer">
            <QRCode value={veriffUrl} size={180} />
          </a>
          <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-word' }}>{veriffUrl}</p>
        </div>
      )}

      {capturaUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3>Escanea el QR para tomar fotos desde otro dispositivo</h3>
          <a href={capturaUrl} target="_blank" rel="noopener noreferrer">
            <QRCode value={capturaUrl} size={180} />
          </a>
          <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-word' }}>{capturaUrl}</p>
        </div>
      )}

      {sessionId && (
        <button
          className='boton-escanear-qr'
          onClick={handleStartPolling}
          style={{ fontSize: 16, padding: '10px 30px' }}
        >
          Ya escaneé / Empezar verificación
        </button>
      )}

      {!veriffUrl && !capturaUrl && <p>No se encontró URL para generar códigos QR.</p>}
    </div>
  );
}