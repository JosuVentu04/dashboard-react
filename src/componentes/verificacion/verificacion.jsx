import React, { useState, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';

function VeriffQR({ originalUrl }) {
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    async function getShortUrl() {
      if (!originalUrl) {
        setShortUrl('');
        return;
      }
      try {
        setShortUrl(originalUrl);
      } catch (err) {
        console.error('Error acortando URL:', err);
        setShortUrl(originalUrl); // fallback
      }
    }
    getShortUrl();
  }, [originalUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Escanea este código QR para verificar tu identidad</h2>
      <QRCode value={shortUrl || originalUrl} size={200} />
      <p style={{ marginTop: 15, fontSize: 15 }}>
        Usa tu teléfono para abrir el proceso de verificación.
      </p>
      {shortUrl && (
        <div style={{ marginTop: 10, fontSize: 11 }}>
          <span>Enlace corto:</span> <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </div>
      )}
    </div>
  );
}

export default VeriffQR;

