import { startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDatosUsuario } from '../../context/DatosUsuarioContext';

export default function FirmarContrato() {
  const { datosUsuario, setDatosUsuario } = useDatosUsuario();
  const { nombre, apellido } = datosUsuario;

  const [firmado, setFirmado] = useState(false);
  const [alerta, setAlerta] = useState('');
  const fechaActual = new Date().toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

  const handleFirmaHuella = async () => {
    setAlerta('');
    const resp = await fetch('http://127.0.0.1:5000/api/webauthn/options');
    const options = await resp.json();

    try {
      const authResp = await startAuthentication(options);
      const verifyResp = await fetch('http://127.0.0.1:5000/api/webauthn/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp),
      });
      const result = await verifyResp.json();
      if (result.success) {
        setFirmado(true);
        setAlerta('¡Contrato firmado con huella!');
      } else {
        setAlerta('Firma fallida.');
      }
    } catch (e) {
      setAlerta('No se pudo realizar la verificación biométrica.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Firmar Contrato</h2>
      <p>Por favor, firma el contrato utilizando tu huella dactilar.</p>

      <div
        id="contrato"
        style={{
          margin: '40px auto',
          maxWidth: '600px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '32px',
          fontFamily: 'sans-serif',
          background: '#f8f8f8',
        }}
      >
        <h3 style={{ textAlign: 'center' }}>Contrato de Servicios</h3>
        <p>
          Entre <strong>Empresa Demo S.A. de C.V.</strong> y el cliente{' '}
          <strong>{nombre} {apellido}</strong>, se acuerda lo siguiente:
        </p>
        <ul style={{ textAlign: 'left' }}>
          <li>Duración: 12 meses</li>
          <li>Monto: $5,000.00 MXN</li>
          <li>{fechaActual}</li>
          <li>Condiciones: Los servicios se prestarán conforme a los lineamientos establecidos en este documento.</li>
        </ul>
        <p>
          Firmado digitalmente por el cliente mediante autenticación biométrica WebAuthn/FIDO2.
        </p>
        <div style={{ marginTop: 60, textAlign: 'left' }}>
          <span>______________________</span>
          <br />
          <span>Firma de {nombre} {apellido}</span>
        </div>
      </div>

      {!firmado && (
        <button onClick={handleFirmaHuella} style={{ marginTop: 24 }}>
          Firmar con huella dactilar
        </button>
      )}
      {alerta && <div style={{ marginTop: 18, color: firmado ? 'green' : 'red' }}>{alerta}</div>}
      <p style={{ marginTop: 14, fontSize: 13 }}>
        (Funcionalidad activa si configuras el backend WebAuthn correctamente)
      </p>
    </div>
  );
}