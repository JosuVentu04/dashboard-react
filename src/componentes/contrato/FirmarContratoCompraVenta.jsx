import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FirmarContratoCompraVenta() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const contratoGuardado = localStorage.getItem("ContratoCreado");

    // 1️⃣ Si existe en localStorage
    if (contratoGuardado) {
      const c = JSON.parse(contratoGuardado);
      if (c.id === parseInt(id)) {
        setContrato(c);
        obtenerCliente(c.cliente_id);
      }
    } else {
      // 2️⃣ Si no, pedir al backend
      fetch(`http://localhost:5000/api/contratos/compra-venta/${id}`)
        .then(res => res.json())
        .then(data => {
          setContrato(data.contrato);
          if (data.contrato?.cliente_id) {
            obtenerCliente(data.contrato.cliente_id);
          }
        })
        .catch(err => console.error("Error al cargar contrato:", err));
    }
  }, [id]);

  // 🔹 Función para obtener el cliente
  const obtenerCliente = (clienteId) => {
    fetch(`http://localhost:5000/users/cliente/${clienteId}`)
      .then(res => res.json())
      .then(data => setCliente(data.cliente))
      .catch(err => console.error("Error al cargar cliente:", err));
  };

  if (!contrato) return <p>Cargando contrato...</p>;
  if (!cliente) return <p>Cargando información del cliente...</p>;

  // 🔹 Generar cuotas dinámicamente
  const cuotas = Array.from(
    { length: contrato.num_pagos_semanales },
    () => parseFloat(contrato.pago_semanal)
  );

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 24,
        background: "#f8f8f8",
        borderRadius: 12,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Contrato de Compra-Venta</h2>
      <p>
        <strong>Cliente:</strong> {cliente.nombre} {cliente.apellido}
      </p>
      <p>
        <strong>Precio Total:</strong> $
        {parseFloat(contrato.precio_total).toFixed(2)}
      </p>
      <p>
        <strong>Pago Inicial:</strong> $
        {parseFloat(contrato.pago_inicial).toFixed(2)}
      </p>
      <p>
        <strong>Duración del Plan:</strong>{" "}
        {contrato.num_pagos_semanales} semanas
      </p>
      <p>
        <strong>Pago Semanal:</strong> $
        {parseFloat(contrato.pago_semanal).toFixed(2)}
      </p>

      <h3>Cuotas Semanales:</h3>
      <ul>
        {cuotas.map((c, idx) => (
          <li key={idx}>
            Semana {idx + 1}: ${c.toFixed(2)}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 40 }}>
        <p>
          Firmado digitalmente por el cliente mediante autenticación biométrica
          WebAuthn/FIDO2.
        </p>
        <div style={{ marginTop: 20 }}>
          <span>______________________</span>
          <br />
          <span>
            Firma de {cliente.nombre} {cliente.apellido}
          </span>
        </div>
      </div>

      <button
        onClick={() => alert("Aquí iría la lógica de firma biométrica")}
        style={{ marginTop: 24, padding: "8px 16px" }}
      >
        Firmar Contrato
      </button>
    </div>
  );
}