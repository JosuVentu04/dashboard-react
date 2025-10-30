import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FirmarContratoCompraVenta() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState(null);
  const [firmado, setFirmado] = useState(false);
  const [alerta, setAlerta] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const contratoGuardado = localStorage.getItem("ContratoCreado");
    if (contratoGuardado) {
      const c = JSON.parse(contratoGuardado);
      if (c.id === parseInt(id)) {
        setContrato(c);
        obtenerCliente(c.cliente_id);
      }
    } else {
      fetch(`http://localhost:5000/api/contratos/compra-venta/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.contrato) {
            setError("Contrato no encontrado");
            return;
          }
          setContrato(data.contrato);
          if (data.contrato.cliente_id) {
            obtenerCliente(data.contrato.cliente_id);
          }
        })
        .catch(err => setError("Error al cargar contrato: " + err.message));
    }
  }, [id]);  

  const obtenerCliente = async (clienteId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token JWT no encontrado. Por favor inicia sesión.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/users/cliente/${clienteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
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

  const cuotas = Array.from(
    { length: contrato.num_pagos_semanales },
    () => parseFloat(contrato.pago_semanal)
  );

  // Función para marcar como firmado (simulación local)
  const marcarComoFirmado = () => {
    const nuevoContrato = { ...contrato, estado_contrato: "FIRMADO", fecha_firma: new Date().toISOString() };
    setContrato(nuevoContrato);
    setFirmado(true);
    setAlerta('Contrato marcado como firmado (simulación).');
    localStorage.setItem("ContratoCreado", JSON.stringify(nuevoContrato));
    setTimeout(() => {
      navigate(`/verificar-contrato-compra-venta/${nuevoContrato.id}`);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, background: "#f8f8f8", borderRadius: 12 }}>
      <h2 style={{ textAlign: "center" }}>Contrato de Compra-Venta</h2>
      <p>
        <strong>Cliente:</strong> 
        {cliente.primer_nombre} {cliente.apellido_paterno}{cliente.apellido_materno ? " " + cliente.apellido_materno : ""}
      </p>
      <p><strong>Numero de identificacion de cliente:</strong> {cliente.numero_identificacion}</p>
      <p><strong>Precio Total:</strong> ${parseFloat(contrato.precio_total).toFixed(2)}</p>
      <p><strong>Pago Inicial:</strong> ${parseFloat(contrato.pago_inicial).toFixed(2)}</p>
      <p><strong>Duración del Plan:</strong> {contrato.num_pagos_semanales} semanas</p>
      <p><strong>Pago Semanal:</strong> ${parseFloat(contrato.pago_semanal).toFixed(2)}</p>

      <h3>Cuotas Semanales:</h3>
      <ul>
        {cuotas.map((c, idx) => (
          <li key={idx}>Semana {idx + 1}: ${c.toFixed(2)}</li>
        ))}
      </ul>

      <div style={{ marginTop: 40 }}>
        <p>Firmado digitalmente por el cliente mediante autenticación biométrica WebAuthn/FIDO2.</p>
        <div style={{ marginTop: 20 }}>
          <span>______________________</span><br />
          <span>
            Firma de {cliente.primer_nombre} {cliente.apellido_paterno}{cliente.apellido_materno ? " " + cliente.apellido_materno : ""}
          </span>
        </div>
      </div>

      {!firmado && (
        <button
          onClick={marcarComoFirmado}
          style={{ marginTop: 24, padding: "8px 16px", background: "#ffa500", color: "#fff", border: "none", borderRadius: 4 }}
        >
          Marcar como firmado (temporal)
        </button>
      )}

      {alerta && <div style={{ marginTop: 18, color: firmado ? 'green' : 'red' }}>{alerta}</div>}
    </div>
  );
}