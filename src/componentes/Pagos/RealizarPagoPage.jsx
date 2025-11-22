import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function RealizarPagoPage() {
  const { api } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const codigo = queryParams.get("codigo"); // MP-XXXX o teléfono

  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Obtener los datos del cliente
  useEffect(() => {
    async function cargarCliente() {
      try {
        const res = await api.get(`/users/saldo/${codigo}`);
        setCliente(res.data.usuario);
        setContratos(res.data.contratos);
      } catch (error) {
        console.error(error);
        alert("Cliente no encontrado");
        navigate("/");
      }
    }
    cargarCliente();
  }, [codigo]);

  async function registrarPago(e) {
    e.preventDefault();
    if (!contratoSeleccionado || !monto) return;

    try {
      const res = await api.post("/pagos/registrar", {
        contrato_id: contratoSeleccionado,
        monto: parseFloat(monto),
        metodo: "EFECTIVO"
      });

      setMensaje(`Pago registrado. Nuevo saldo: $${res.data.saldo_pendiente}`);
      setMonto("");

      // Refrescar datos del cliente
      const update = await api.get(`/users/saldo/${codigo}`);
      setContratos(update.data.contratos);

    } catch (error) {
      console.error(error);
      alert("Error al registrar pago");
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
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
      {contratos.length === 0 && <p>No tiene adeudos.</p>}

      {contratos.map(c => (
        <div
          key={c.id}
          className={`card p-2 mb-2 ${contratoSeleccionado === c.id ? "border-primary" : ""}`}
          onClick={() => setContratoSeleccionado(c.id)}
          style={{ cursor: "pointer" }}
        >
          <strong>Contrato #{c.id}</strong>
          <p>Saldo pendiente: ${c.saldo_pendiente}</p>
          <p>Estado: {c.estado}</p>
        </div>
      ))}

      {contratoSeleccionado && (
        <form onSubmit={registrarPago} className="mt-3">
          <label>Monto a pagar</label>
          <input
            type="number"
            className="form-control mb-3"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />

          <button className="btn btn-success w-100">
            Confirmar pago
          </button>
        </form>
      )}

      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
    </div>
  );
}
