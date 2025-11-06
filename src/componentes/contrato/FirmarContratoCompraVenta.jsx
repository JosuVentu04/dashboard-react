import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function FirmarContratoCompraVenta() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState(null);
  const [firmado, setFirmado] = useState(false);
  const [alerta, setAlerta] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- Cargar contrato y cliente ---
  useEffect(() => {
    const contratoGuardado = localStorage.getItem("ContratoCreado");
    if (contratoGuardado) {
      const c = JSON.parse(contratoGuardado);
      if (c.id === parseInt(id)) {
        setContrato(c);
        obtenerCliente(c.cliente_id);
        return;
      }
    }

    fetch(`${API_URL}/api/contratos/compra-venta/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.contrato) {
          setError("Contrato no encontrado");
          return;
        }
        setContrato(data.contrato);
        if (data.contrato.cliente_id) {
          obtenerCliente(data.contrato.cliente_id);
        }
      })
      .catch((err) => setError("Error al cargar contrato: " + err.message));
  }, [id]);

  const obtenerCliente = async (clienteId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token JWT no encontrado. Por favor inicia sesión.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/cliente/${clienteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data || !data.id) {
        setError(`Error al cargar cliente: estructura inesperada en la respuesta`);
        return;
      }
      setCliente(data);
    } catch (err) {
      setError("Error de conexión al cargar cliente: " + err.message);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!contrato) return <p>Cargando contrato...</p>;
  if (!cliente) return <p>Cargando información del cliente...</p>;

  // --- Generar lista de cuotas ---
  const cuotas = Array.from(
    { length: contrato.num_pagos_semanales },
    () => parseFloat(contrato.pago_semanal)
  );

  // ✅ Generar hash SHA-256 del contrato HTML
  async function generarHashContrato(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ✅ Guardar contrato firmado en backend
  async function guardarContratoFirmado(contratoHTML, hash) {
    const empleadosData = localStorage.getItem("DatosEmpleado");
    try {
      const body = {
        empleado_id: empleadosData ? JSON.parse(empleadosData).id : null,
        contrato_id: contrato.id,
        contrato_html: contratoHTML,
        hash_contrato: hash,
        estado_contrato: "FIRMADO",
        fecha_firma: new Date().toISOString(),
        cliente_id: cliente.id,
      };

      const res = await fetch(`${API_URL}/api/contratos/compra-venta/firmar-contrato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFirmado(true);
        setAlerta("Contrato firmado y guardado correctamente.");
        localStorage.setItem("ContratoCreado", JSON.stringify(data.contrato));
        setTimeout(() => navigate(`/verificar-contrato-compra-venta/${data.contrato.id}`), 1500);
      } else {
        setAlerta("Error al guardar contrato: " + (data.message || ""));
      }
    } catch (e) {
      console.error(e);
      setAlerta("Error al enviar contrato al backend: " + e.message);
    }
  }

  // --- Firma temporal (sin huella) ---
  const handleFirmaTemporal = async () => {
    setLoading(true);
    try {
      const contratoHTML = document.getElementById("contratoCV").outerHTML;
      const hash = await generarHashContrato(contratoHTML);
      await guardarContratoFirmado(contratoHTML, hash);
    } catch (e) {
      console.error(e);
      setAlerta("Error al firmar contrato temporalmente: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Firma con huella (biométrica) ---
  const handleFirmaHuella = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/webauthn/options`);
      const options = await resp.json();
      const authResp = await startAuthentication(options);
      const verifyResp = await fetch(`${API_URL}/api/webauthn/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResp),
      });
      const result = await verifyResp.json();

      if (result.success) {
        const contratoHTML = document.getElementById("contratoCV").outerHTML;
        const hash = await generarHashContrato(contratoHTML);
        await guardarContratoFirmado(contratoHTML, hash);
      } else {
        setAlerta("Firma biométrica fallida.");
      }
    } catch (e) {
      console.error(e);
      setAlerta("Error al firmar con huella: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, background: "#f8f8f8", borderRadius: 12 }}>
      <h2 style={{ textAlign: "center" }}>Contrato de Compra-Venta</h2>

      <div id="contratoCV">
        <p>
          <strong>Cliente:</strong>{" "}
          {cliente.primer_nombre} {cliente.apellido_paterno}{" "}
          {cliente.apellido_materno ? cliente.apellido_materno : ""}
        </p>

        <p><strong>Número de identificación:</strong> {cliente.numero_identificacion}</p>
        <p><strong>Precio Total:</strong> ${parseFloat(contrato.precio_total).toFixed(2)}</p>
        <p><strong>Pago Inicial:</strong> ${parseFloat(contrato.pago_inicial).toFixed(2)}</p>
        <p><strong>Duración:</strong> {contrato.num_pagos_semanales} semanas</p>
        <p><strong>Pago Semanal:</strong> ${parseFloat(contrato.pago_semanal).toFixed(2)}</p>

        <h3>Cuotas Semanales:</h3>
        <ul>
          {cuotas.slice(0, -1).map((c, idx) => (
            <li key={idx}>Semana {idx + 1}: ${c.toFixed(2)}</li>
          ))}
          <li>
            Semana {cuotas.length}: $
            {contrato.ultimo_pago_semanal
              ? parseFloat(contrato.ultimo_pago_semanal).toFixed(2)
              : parseFloat(contrato.pago_semanal).toFixed(2)}{" "}
            (última)
          </li>
        </ul>

        <div style={{ marginTop: 40 }}>
          <p>Firmado digitalmente por el cliente mediante autenticación biométrica WebAuthn/FIDO2.</p>
          <div style={{ marginTop: 20 }}>
            <span>______________________</span>
            <br />
            <span>
              Firma de {cliente.primer_nombre} {cliente.apellido_paterno}{" "}
              {cliente.apellido_materno ? cliente.apellido_materno : ""}
            </span>
          </div>
        </div>
      </div>

      {!firmado && (
        <>
          <button
            onClick={handleFirmaHuella}
            disabled={loading}
            style={{ marginTop: 24, padding: "8px 16px" }}
          >
            {loading ? "Firmando..." : "Firmar con huella dactilar"}
          </button>

          <button
            onClick={handleFirmaTemporal}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              backgroundColor: "#ffa500",
              color: "#fff",
              border: "none",
              borderRadius: 4,
            }}
          >
            Marcar como firmado (temporal)
          </button>
        </>
      )}

      {alerta && <div style={{ marginTop: 18, color: firmado ? "green" : "red" }}>{alerta}</div>}
    </div>
  );
}