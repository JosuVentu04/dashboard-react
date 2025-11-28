import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qrcode-logo';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function QRPage() {
  const query = useQuery();

  const veriffUrl = query.get('url');        // Normalmente la URL oficial de Veriff
  const sessionId = query.get('sessionId');
  const clienteExistente = query.get('clienteExistente') === "true";
  const clienteId = query.get('clienteId');

  const navigate = useNavigate();
  localStorage.setItem('sessionIdActual', sessionId);

  // --- URL que apunta a TU página de captura ---
  const capturaUrl = sessionId
    ? `${window.location.origin}/captura?sessionId=${sessionId}&clienteExistente=${clienteExistente}&clienteId=${clienteId}`
    : null;

  const handleStartPolling = () => {
    if (sessionId) {
      navigate(`/polling?sessionId=${sessionId}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>

      {/* ------------------------------
          CLIENTE EXISTENTE → SOLO TU QR
          ------------------------------ */}
      {clienteExistente && capturaUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3>Escanea este QR para tomar la selfie</h3>
          <a href={capturaUrl} target="_blank" rel="noopener noreferrer">
            <QRCode value={capturaUrl} size={180} />
          </a>
          <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-word' }}>
            {capturaUrl}
          </p>
        </div>
      )}

      {/* -----------------------------------------------------
         CLIENTE NUEVO → Mostrar ambos QRs como antes
         ----------------------------------------------------- */}
      {!clienteExistente && veriffUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3>Escanea el QR oficial de Veriff</h3>
          <a href={veriffUrl} target="_blank" rel="noopener noreferrer">
            <QRCode value={veriffUrl} size={180} />
          </a>
          <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-word' }}>
            {veriffUrl}
          </p>
        </div>
      )}

      {!clienteExistente && capturaUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3>Escanea el QR para tomar fotos desde otro dispositivo</h3>
          <a href={capturaUrl} target="_blank" rel="noopener noreferrer">
            <QRCode value={capturaUrl} size={180} />
          </a>
          <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-word' }}>
            {capturaUrl}
          </p>
        </div>
      )}

      {/* Botón solo para cliente nuevo */}
      {!clienteExistente && sessionId && (
        <button
          className='boton-escanear-qr'
          onClick={handleStartPolling}
          style={{ fontSize: 16, padding: '10px 30px' }}
        >
          Ya escaneé / Empezar verificación
        </button>
      )}

      {!veriffUrl && !capturaUrl && (
        <p>No se encontró URL para generar códigos QR.</p>
      )}
    </div>
  );
}