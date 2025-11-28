import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function VentaClienteResumen() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clienteId = searchParams.get("clienteId");

  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creandoSesion, setCreandoSesion] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await api.get(`/users/${clienteId}/resumen`);
        setCliente(res.data.cliente);
        setContratos(res.data.contratos);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [clienteId]);

  if (loading) return <p>Cargando...</p>;
  if (!cliente) return <p>Cliente no encontrado</p>;

  const tieneContratoPendiente =
    contratos.some(c => c.estado_deuda !== "LIQUIDADO");

  // --------------------------------------------------------------------
  // 📌 Crear sesión de Veriff para cliente EXISTENTE
  // --------------------------------------------------------------------
  async function iniciarVenta() {
  try {
    setCreandoSesion(true);

    // Datos del cliente desde el backend
    const { primer_nombre, apellido_paterno, numero_telefonico } = cliente;

    // 1. Crear sesión de Veriff (solo usamos el sessionId)
    const response = await api.post("/api/veriff/create-session", {
      userId: user?.nombre || "Vendedor",
      customerName: primer_nombre,
      customerLastName: apellido_paterno,
      telefono: numero_telefonico
    });

    const sessionId = response.data.verification.id;

    // Guardar datos del empleado
    localStorage.setItem("DatosEmpleado", JSON.stringify(user));

    // 2. URL personalizada hacia tu página Captura
    const capturaUrl = `${window.location.origin}/captura?sessionId=${sessionId}&clienteExistente=true&clienteId=${clienteId}`;

    // 3. Acortar URL (opcional)
    const res = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(capturaUrl)}`
    );

    const shortUrl = res.data;

    // 4. Redirigir a vista QR SOLO de tu app
    navigate(`/qr?url=${encodeURIComponent(shortUrl)}&sessionId=${sessionId}&clienteExistente=true&clienteId=${clienteId}`);

  } catch (error) {
    console.error("Error al crear sesión o acortar URL:", error);
    alert("Hubo un error al iniciar el proceso.");
  } finally {
    setCreandoSesion(false);
  }
}

  return (
    <div className="container mt-4">

      <h2>Cliente encontrado</h2>

      <div className="card p-3 mb-4">
        <h4>{cliente.nombre} {cliente.apellido}</h4>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>ID:</strong> {cliente.id}</p>
      </div>

      <h3>Contratos del cliente</h3>

      {contratos.length === 0 && (
        <p>Este cliente no tiene contratos previos.</p>
      )}

      {contratos.map(c => (
        <div className="card p-3 mb-3" key={c.id}>
          <p><strong>Contrato:</strong> {c.id}</p>
          <p><strong>Estado:</strong> {c.estado_deuda}</p>
          <p><strong>Saldo pendiente:</strong> ${c.saldo_pendiente}</p>
          <p><strong>Dispositivo:</strong> {c.dispositivo}</p>
        </div>
      ))}

      <hr />

      {tieneContratoPendiente ? (
        <div className="alert alert-danger">
          Este cliente tiene contratos activos o con saldo pendiente.
          <br />
          <strong>No puede iniciar una nueva venta.</strong>
        </div>
      ) : (
        <button
          onClick={iniciarVenta}
          className="btn btn-primary"
          disabled={creandoSesion}
        >
          {creandoSesion ? "Creando sesión..." : "Iniciar nueva venta"}
        </button>
      )}

    </div>
  );
}