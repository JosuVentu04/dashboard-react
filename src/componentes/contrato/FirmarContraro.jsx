import { startAuthentication } from '@simplewebauthn/browser';
import { useState, useEffect, useRef } from 'react';
import { useDatosUsuario } from '../../context/DatosUsuarioContext';
import { useNavigate } from 'react-router-dom';

export default function FirmarContrato() {
  const { datosUsuario } = useDatosUsuario();
  const [contrato, setContrato] = useState(null);
  const [firmado, setFirmado] = useState(false);
  const [alerta, setAlerta] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const datosUsuarioRaw = localStorage.getItem('DatosUsuario');
  const datosEmpleadoRaw = localStorage.getItem('DatosEmpleado');
  const cliente = datosUsuarioRaw ? JSON.parse(datosUsuarioRaw)?.clienteFiltrado || {} : {};
  const empleado = datosEmpleadoRaw ? JSON.parse(datosEmpleadoRaw) || {} : {};
  const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const contratoCreando = useRef(false);

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

  // ✅ Función hash
  async function generarHashContrato(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ✅ Función genérica para enviar el contrato al backend (se usa en ambos flujos)
  async function guardarContratoFirmado(contrato, cliente, datosUsuario, contratoHTML, hash) {
    const body = {
      contrato_id: contrato.id,
      cliente_id: cliente.id || datosUsuario?.id,
      nombre: cliente.primer_nombre || datosUsuario?.primer_nombre || '',
      apellido: cliente.apellido_paterno || datosUsuario?.apellido_paterno || '',
      fecha_firma: new Date().toISOString(),
      estado_contrato: 'FIRMADO',
      contrato_html: contratoHTML,
      hash_contrato: hash,
    };

    const saveResp = await fetch(`${API_URL}/api/contratos/firmar-contrato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const saveResult = await saveResp.json();
    if (saveResult.success) {
      setContrato(saveResult.contrato);
      setAlerta('Contrato guardado correctamente en la base de datos.');
      setTimeout(() => navigate(`/verificar-contrato/${saveResult.contrato.id}`), 1500);
    } else {
      setAlerta('Error al guardar el contrato: ' + (saveResult.message || ''));
    }
  }

  // --- Firma biométrica ---
  const handleFirmaHuella = async () => {
    if (!contrato) {
      setAlerta('Aún no se ha creado el contrato.');
      return;
    }
    setLoading(true);
    setAlerta('');

    try {
      const resp = await fetch(`${API_URL}/api/webauthn/options`);
      if (!resp.ok) throw new Error('No se pudieron obtener las opciones de autenticación.');
      const options = await resp.json();

      const authResp = await startAuthentication(options);
      const verifyResp = await fetch(`${API_URL}/api/webauthn/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp),
      });
      const result = await verifyResp.json();

      if (result.success) {
        setFirmado(true);
        setAlerta('¡Contrato firmado con huella!');
        const contratoHTML = document.getElementById('contrato').outerHTML;
        const hash = await generarHashContrato(contratoHTML);
        await guardarContratoFirmado(contrato, cliente, datosUsuario, contratoHTML, hash);
      } else {
        setAlerta('Firma fallida.');
      }
    } catch (e) {
      console.error(e);
      setAlerta('No se pudo realizar la verificación biométrica: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Botón temporal que también genera hash y guarda
  const handleFirmaTemporal = async () => {
    if (!contrato) {
      setAlerta('Aún no se ha creado el contrato.');
      return;
    }

    setLoading(true);
    try {
      const contratoHTML = document.getElementById('contrato').outerHTML;
      const hash = await generarHashContrato(contratoHTML);
      setFirmado(true);
      setAlerta('Contrato marcado como firmado (temporal).');
      await guardarContratoFirmado(contrato, cliente, datosUsuario, contratoHTML, hash);
    } catch (e) {
      console.error(e);
      setAlerta('Error al firmar contrato temporalmente: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40, maxWidth: 700, marginInline: 'auto' }}>
      <h2>Firmar Contrato</h2>
      <p>El contrato se genera automáticamente al cargar la página. Luego puedes firmarlo con tu huella dactilar.</p>

      <div
        id="contrato"
        style={{
          margin: '40px auto',
          maxWidth: '600px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '32px',
          background: '#f8f8f8',
          textAlign: 'left',
        }}
      >
        <h3 style={{ textAlign: 'center' }}>Contrato de Servicios</h3>
        <p>
          Entre <strong>Empresa Demo S.A. de C.V.</strong> y el cliente{' '}
          <strong>
            {cliente.primer_nombre || datosUsuario?.primer_nombre || ''} {cliente.apellido_paterno || datosUsuario?.apellido_paterno || ''}
          </strong>
          , se acuerda lo siguiente:
        </p>
        <ul>
          <li>Duración: 12 meses</li>
          <li>Monto: $5,000.00 MXN</li>
          <li>{fechaActual}</li>
          <li>Condiciones: Los servicios se prestarán conforme a los lineamientos establecidos en este documento.</li>
        </ul>
        <p>Firmado digitalmente por el cliente mediante autenticación biométrica WebAuthn/FIDO2.</p>
        <div style={{ marginTop: 60 }}>
          <span>______________________</span>
          <br />
          <span>
            Firma de {cliente.primer_nombre || datosUsuario?.primer_nombre || ''}{' '}
            {cliente.apellido_paterno || datosUsuario?.apellido_paterno || ''}
          </span>
        </div>
      </div>

      {contrato && !firmado && (
        <>
          <button onClick={handleFirmaHuella} disabled={loading} style={{ marginTop: 24, padding: '8px 16px' }}>
            {loading ? 'Firmando...' : 'Firmar con huella dactilar'}
          </button>

          <button
            onClick={handleFirmaTemporal}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              backgroundColor: '#ffa500',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
            }}
          >
            Marcar como firmado (temporal)
          </button>
        </>
      )}

      {alerta && <div style={{ marginTop: 18, color: firmado ? 'green' : 'red' }}>{alerta}</div>}

      <p style={{ marginTop: 14, fontSize: 13 }}>(Funcionalidad activa si configuras el backend WebAuthn correctamente)</p>
    </div>
  );
}
