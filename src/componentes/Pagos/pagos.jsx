import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HistorialPagos from "./HistorialPagos";

export default function RealizarPagoPage() {
  const { api } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const codigo = queryParams.get("codigo");

  const [cliente, setCliente] = useState(null);
  const [contratosBasicos, setContratosBasicos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [datosContrato, setDatosContrato] = useState(null);

  const [semanas, setSemanas] = useState(1);
  const [semanasPersonalizadas, setSemanasPersonalizadas] = useState("");
  const [montoCalculado, setMontoCalculado] = useState(0);

  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // 🔹 Cargar cliente y contratos
  useEffect(() => {
    async function cargarCliente() {
      try {
        const res = await api.get(`/users/saldo/${codigo}`);
        setCliente(res.data.usuario);
        setContratosBasicos(res.data.saldos);
      } catch (error) {
        console.error(error);
        alert("Cliente no encontrado");
        navigate("/");
      }
    }
    cargarCliente();
  }, [codigo]);

  // 🔹 Cargar contrato + historial
  useEffect(() => {
    if (!contratoSeleccionado) return;

    async function cargarContrato() {
      try {
        // 📌 Detalles del contrato
        const res = await api.get(`/api/contratos/compra-venta/${contratoSeleccionado}`);
        setDatosContrato(res.data.contrato);

        // 📌 Historial de pagos
        const pagosRes = await api.get(`/pagos/historial/${contratoSeleccionado}`);
        setHistorial(pagosRes.data.historial);

      } catch (e) {
        console.error(e);
        alert("Error obteniendo datos del contrato");
      }
    }

    cargarContrato();
  }, [contratoSeleccionado]);

  // 🔹 Calcular monto del pago
  useEffect(() => {
    if (!datosContrato) return;

    const pagoSemanal = Number(datosContrato.pago_semanal);
    const saldoPendiente = Number(datosContrato.saldo_pendiente);
    const semanasTotales = datosContrato.num_pagos_semanales;

    const semanasSel = semanasPersonalizadas
      ? parseInt(semanasPersonalizadas)
      : semanas;

    if (semanasSel >= semanasTotales) {
      setMontoCalculado(saldoPendiente);
    } else {
      setMontoCalculado(semanasSel * pagoSemanal);
    }
  }, [semanas, semanasPersonalizadas, datosContrato]);

  // 🔹 Registrar Pago
  async function registrarPago(e) {
    e.preventDefault();
    if (!contratoSeleccionado) return;

    const semanasAPagar = semanasPersonalizadas
      ? parseInt(semanasPersonalizadas)
      : semanas;

    try {
      const res = await api.post("/pagos/registrar", {
        contrato_id: contratoSeleccionado,
        semanas: semanasAPagar,
        monto: montoCalculado,
        metodo: "EFECTIVO",
      });

      // 📌 Actualizar historial de pagos
      setHistorial(res.data.historial_pagos);

      // 📌 Mensaje
      setMensaje(`Pago registrado exitosamente. Nuevo saldo: $${res.data.saldo_pendiente}`);

      // Reset
      setSemanas(1);
      setSemanasPersonalizadas("");

      // 📌 Actualizar lista de contratos
      const update = await api.get(`/users/saldo/${codigo}`);
      setContratosBasicos(update.data.saldos);

      // Volver a cargar detalles
      setDatosContrato(null);
      setContratoSeleccionado(null);

    } catch (error) {
      console.error(error);
      alert("Error al registrar pago");
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "650px" }}>
      <h2 className="text-center mb-3">Registrar Pago</h2>

      {cliente && (
        <div className="card p-3 mb-4">
          <h5>Cliente</h5>
          <p><strong>Nombre:</strong> {cliente.nombre}</p>
          <p><strong>Código:</strong> {cliente.codigo}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        </div>
      )}

      <h5>Contratos con adeudo</h5>

      {contratosBasicos.length === 0 && <p>No tiene adeudos.</p>}

      {contratosBasicos.map(c => (
        <div
          key={c.contrato_id}
          className={`card p-2 mb-2 ${contratoSeleccionado === c.contrato_id ? "border-primary" : ""}`}
          onClick={() => setContratoSeleccionado(c.contrato_id)}
          style={{ cursor: "pointer" }}
        >
          <strong>Contrato #{c.contrato_id}</strong>
          <p>Saldo pendiente: ${c.saldo_pendiente}</p>
        </div>
      ))}

      {datosContrato && (
        <div className="card p-3 mb-3">
          <h5>Detalle del contrato</h5>
          <p><strong>Pago semanal:</strong> ${datosContrato.pago_semanal}</p>
          <p><strong>Deuda Total</strong> ${datosContrato.precio_total}</p>
          <p><strong>Pagos restantes:</strong> {datosContrato.num_pagos_semanales}</p>
          <p><strong>Saldo pendiente:</strong> ${datosContrato.saldo_pendiente}</p>
          <p><strong>Saldo pagado:</strong> ${(datosContrato.precio_total - datosContrato.saldo_pendiente)}</p>
          <p><strong>Estado:</strong> {datosContrato.estado_deuda}</p>
        </div>
      )}

      {datosContrato && (
        <form onSubmit={registrarPago} className="mt-3">
          <label>Selecciona semanas a pagar</label>

          <select
            className="form-control mb-3"
            value={semanas}
            onChange={(e) => setSemanas(parseInt(e.target.value))}
          >
            <option value={1}>1 Semana</option>
            <option value={2}>1 Quincena</option>
            <option value={4}>1 Mes</option>
          </select>

          <label>¿Pagar más semanas? (opcional)</label>
          <input
            type="number"
            min="5"
            max={datosContrato?.num_pagos_semanales}
            className="form-control mb-3"
            placeholder="Ej. 6, 8, 12 semanas"
            value={semanasPersonalizadas}
            onChange={(e) => setSemanasPersonalizadas(e.target.value)}
          />

          <div className="alert alert-info text-center">
            <strong>Total a pagar: ${montoCalculado}</strong>
          </div>

          <button className="btn btn-success w-100">Confirmar pago</button>
        </form>
      )}

      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}

      {/* 📌 HISTORIAL DE PAGOS */}
      <HistorialPagos historial={historial} />
    </div>
  );
}
