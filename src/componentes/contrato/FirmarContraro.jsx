import { startRegistration, startAuthentication, base64URLStringToBuffer } from "@simplewebauthn/browser";
import { useState, useEffect, useRef } from 'react';
import { useDatosUsuario } from '../../context/DatosUsuarioContext';
import { useNavigate } from 'react-router-dom';

export default function FirmarContrato() {
  const { datosUsuario } = useDatosUsuario();
  const [contrato, setContrato] = useState(null);
  const [firmado, setFirmado] = useState(false);
  const [alerta, setAlerta] = useState('');
  const [loading, setLoading] = useState(false);
  const [registroCompleto, setRegistroCompleto] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const datosUsuarioRaw = localStorage.getItem('DatosUsuario');
  const datosEmpleadoRaw = localStorage.getItem('DatosEmpleado');
  const cliente = datosUsuarioRaw ? JSON.parse(datosUsuarioRaw)?.clienteFiltrado || {} : {};
  const empleado = datosEmpleadoRaw ? JSON.parse(datosEmpleadoRaw) || {} : {};
  const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const contratoCreando = useRef(false);

  // Crear contrato automáticamente (igual a antes)
  useEffect(() => {
    const crearContrato = async () => {
      if (contratoCreando.current) return;
      contratoCreando.current = true;

      const contratoGuardado = localStorage.getItem('ContratoCreado');
      if (contratoGuardado) {
        setContrato(JSON.parse(contratoGuardado));
        setAlerta('Contrato cargado desde almacenamiento local.');
        return;
      }

      if (!cliente.id && !datosUsuario?.id) {
        setAlerta('No se encontró un cliente válido.');
        return;
      }

      setLoading(true);
      setAlerta('Creando contrato automáticamente...');

      try {
        const body = {
          cliente_id: cliente.id || datosUsuario?.id,
          empleado_id: empleado.id || 1,
          contrato_url: 'url_base_plantilla_o_dummy',
          hash_contrato: 'hash_placeholder',
          estado_contrato: 'PENDIENTE',
          nombre: cliente.primer_nombre || datosUsuario?.primer_nombre || '',
          apellido: cliente.apellido_paterno || datosUsuario?.apellido_paterno || '',
        };

        const res = await fetch(`${API_URL}/api/contratos/crear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (res.ok) {
          setContrato(data.contrato);
          setAlerta('Contrato creado automáticamente. Ahora puede ser firmado.');
          localStorage.setItem('ContratoCreado', JSON.stringify(data.contrato));
        } else {
          setAlerta('Error al crear contrato: ' + (data.error || ''));
        }
      } catch (e) {
        console.error(e);
        setAlerta('Error en la creación del contrato: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    crearContrato();
  }, []);

  // --- Registro WebAuthn ---
  const handleRegistroWebAuthn = async () => {
    setLoading(true);
    setAlerta('');

    try {
      // 1️⃣ Obtener opciones de registro
      const resp = await fetch(`${API_URL}/api/webauthn/register-options`);
      if (!resp.ok) throw new Error('No se pudieron obtener las opciones de registro.');
      const options = await resp.json();

      // 2️⃣ Ejecutar registro en dispositivo
      const attResp = await startRegistration(options);

      // 3️⃣ Enviar resultado para guardar en backend
      const verifyResp = await fetch(`${API_URL}/api/webauthn/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      });

      const result = await verifyResp.json();
      if (result.success) {
        setAlerta('Registro WebAuthn completado. Puede proceder a firmar.');
        setRegistroCompleto(true);
      } else {
        setAlerta('Error en registro: ' + (result.error || ''));
      }
    } catch (e) {
      console.error(e);
      setAlerta('Error durante el registro WebAuthn: ' + e.message);
    } finally {
      setLoading(false);
    }
  };


  // --- Firma con huella / llave (WebAuthn FIDO2) ---
  const handleFirmaWebAuthn = async () => {
    if (!contrato) {
      setAlerta('Aún no se ha creado el contrato.');
      return;
    }
    if (!registroCompleto) {
      setAlerta('Debe registrar su dispositivo de autenticación primero.');
      return;
    }

    setLoading(true);
    setAlerta('');

    try {
      // 1️⃣ Obtener opciones de autenticación del backend
      const resp = await fetch(`${API_URL}/api/webauthn/auth-options`);
      if (!resp.ok) throw new Error('No se pudieron obtener las opciones de autenticación.');
      const options = await resp.json();

      // 2️⃣ Convertir challenge y allowCredentials a ArrayBuffer
      options.challenge = base64URLStringToBuffer(options.challenge);
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(cred => ({
          ...cred,
          id: base64URLStringToBuffer(cred.id)
        }));
      }

      // 3️⃣ Ejecutar autenticación en el dispositivo
      const authResp = await startAuthentication(options);

      // 4️⃣ Verificar en backend
      const verifyResp = await fetch(`${API_URL}/api/webauthn/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResp),
      });

      const result = await verifyResp.json();
      if (result.success) {
        setFirmado(true);
        setAlerta('¡Contrato firmado con éxito!');

        const contratoHTML = document.getElementById('contrato').outerHTML;
        const body = {
          contrato_id: contrato.id,
          cliente_id: cliente.id || datosUsuario?.id,
          nombre: cliente.primer_nombre || datosUsuario?.primer_nombre || '',
          apellido: cliente.apellido_paterno || datosUsuario?.apellido_paterno || '',
          fecha_firma: new Date().toISOString(),
          estado_contrato: 'FIRMADO',
          contrato_html: contratoHTML,
          hash_contrato: 'hash_firma_placeholder',
        };

        // Guardar contrato firmado en DB
        const saveResp = await fetch(`${API_URL}/api/contratos/firmar-contrato`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const saveResult = await saveResp.json();
        if (saveResult.success) {
          setContrato(saveResult.contrato);
          setTimeout(() => {
            navigate(`/verificar-contrato/${saveResult.contrato.id}`);
          }, 1500);
        } else {
          setAlerta('Error al guardar el contrato: ' + (saveResult.message || ''));
        }
      } else {
        setAlerta('Firma fallida: ' + (result.error || ''));
      }
    } catch (e) {
      console.error(e);
      setAlerta('Error durante la firma WebAuthn: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40, maxWidth: 700, marginInline: 'auto' }}>
      <h2>Firmar Contrato</h2>
      <p>El contrato se genera automáticamente al cargar la página. Luego puedes firmarlo con tu huella o llave Kensington.</p>

      <div id="contrato" style={{ margin: '40px auto', maxWidth: '600px', border: '1px solid #ccc', borderRadius: '10px', padding: '32px', background: '#f8f8f8', textAlign: 'left' }}>
        <h3 style={{ textAlign: 'center' }}>Contrato de Servicios</h3>
        <p>
          Entre <strong>Empresa Demo S.A. de C.V.</strong> y el cliente{' '}
          <strong>{cliente.primer_nombre || datosUsuario?.primer_nombre || ''} {cliente.apellido_paterno || datosUsuario?.apellido_paterno || ''}</strong>, se acuerda lo siguiente:
        </p>
        <ul>
          <li>Duración: 12 meses</li>
          <li>Monto: $5,000.00 MXN</li>
          <li>{fechaActual}</li>
          <li>Condiciones: Los servicios se prestarán conforme a los lineamientos establecidos en este documento.</li>
        </ul>
        <p>Firmado digitalmente mediante autenticación WebAuthn/FIDO2.</p>
        <div style={{ marginTop: 60 }}>
          <button onClick={handleRegistroWebAuthn} disabled={loading} style={{ marginRight: 20 }}>
            {loading ? 'Registrando...' : registroCompleto ? 'Registrado' : 'Registrar dispositivo'}
          </button>
          {contrato && !firmado && (
            <button onClick={handleFirmaWebAuthn} disabled={loading}>
              {loading ? 'Firmando...' : 'Firmar con huella / llave'}
            </button>
          )}
        </div>
      </div>

      {alerta && <div style={{ marginTop: 18, color: firmado ? 'green' : 'red' }}>{alerta}</div>}

      <p style={{ marginTop: 14, fontSize: 13 }}>
        (Funcionalidad activa si configuras el backend FIDO2 correctamente)
      </p>
    </div>
  );
}