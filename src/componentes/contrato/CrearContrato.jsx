import api from "../../api";
import { useEffect, useState, useRef } from "react";

export default function CrearContrato() {
  const ejecutado = useRef(false);
  const datosUsuarioRaw = localStorage.getItem('DatosUsuario');
  const datosEmpleadoRaw = localStorage.getItem('DatosEmpleado');
  const cliente = datosUsuarioRaw ? JSON.parse(datosUsuarioRaw)?.clienteFiltrado || {} : {};
  const empleado = datosEmpleadoRaw ? JSON.parse(datosEmpleadoRaw) || {} : {};

  const [contrato, setContrato] = useState(null);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (ejecutado.current) return; // ya ejecutado, salir
        ejecutado.current = true;
    async function crearContrato() {
      try {
        if (!cliente?.id || !empleado?.id) {
          setError("Faltan datos de cliente o empleado.");
          return;
        }
        const res = await api.post('/api/contratos/crear', {
          empleado_id: empleado.id,
          contrato_url: "http://localhost:3000/contrato_base.html",
          estado_contrato: "PENDIENTE",
          hash_contrato: "abc123def456",
          cliente_id: cliente.id,
        });
        setContrato(res.data.contrato);
      } catch {
        setError("Error al crear el contrato.");
      }
    }
    crearContrato();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [cliente?.id, empleado?.id]);

  useEffect(() => {
    if (!contrato?.id) return;

    async function verificarEstado() {
      try {
        const res = await api.get(`/api/contratos/${contrato.id}`);
        const estado = res.data.contrato.estado_contrato;
        setContrato(res.data.contrato);
        if (estado !== "PENDIENTE" && pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      } catch {
        setError("Error al consultar el estado del contrato.");
      }
    }
    verificarEstado(); // primera llamada inmediata
    pollingRef.current = setInterval(verificarEstado, 5000); // cada 5 seg

    return () => clearInterval(pollingRef.current);
  }, [contrato?.id]);

  return (
    <div className="crear-contrato-componente" style={{textAlign: 'center'}}>
      <h2>Contrato Creado</h2>
      <p>Digita en tu aplicacion esta id del contrato.</p>
      {contrato && (
        <div>
          <p>ID: {contrato.id}</p>
          <p>Estado: {contrato.estado_contrato}</p>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}