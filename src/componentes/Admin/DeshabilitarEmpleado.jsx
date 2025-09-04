import { useEffect, useState } from "react";
import api from "../../api";

export default function DeshabilitarEmpleado() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ rol: "", sucursal_id: "" });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: listaSucursales } = await api.get("/sucursales");

      const sucursalesConEmpleados = await Promise.all(
        listaSucursales.map(async (suc) => {
          const { data: empleados } = await api.get(
            `/empleados?sucursal_id=${suc.id}`
          );
          return { ...suc, empleados };
        })
      );

      setSucursales(sucursalesConEmpleados);
    } catch (err) {
      setError(err.response?.data?.error || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoEmpleado = async (id, estadoActual) => {
    const nuevoEstado =
      estadoActual === "INACTIVO" ? "ACTIVO" : "INACTIVO";

    try {
      await api.put(`/users/modificar-empleado/${id}`, {
        estado_usuario: nuevoEstado,
      });

      // ✅ Actualiza solo el empleado afectado en memoria
      setSucursales(prev =>
        prev.map(suc => ({
          ...suc,
          empleados: suc.empleados.map(emp =>
            emp.id === id ? { ...emp, estado_usuario: nuevoEstado } : emp
          )
        }))
      );

    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar estado");
    }
  };

  const guardarCambios = async (id) => {
    try {
      await api.put(`/users/modificar-empleado/${id}`, form);

      // ✅ Actualiza localmente solo el empleado
      setSucursales(prev =>
        prev.map(suc => ({
          ...suc,
          empleados: suc.empleados.map(emp =>
            emp.id === id
              ? { ...emp, rol: form.rol, sucursal_id: form.sucursal_id }
              : emp
          )
        }))
      );

      setEditando(null);
      setForm({ rol: "", sucursal_id: "" });

    } catch (err) {
      alert(err.response?.data?.error || "Error al modificar empleado");
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container py-3">
      {sucursales.length === 0 ? (
        <p>No hay sucursales registradas.</p>
      ) : (
        sucursales.map((sucursal) => (
          <div key={sucursal.id} className="sucursal-admin mb-4 p-3 border rounded">
            <h2>{sucursal.nombre}</h2>
            <p>
              <strong>ID:</strong> {sucursal.id} |{" "}
              <strong>Estado:</strong> {sucursal.estado_sucursal}
            </p>
            <p><strong>Dirección:</strong> {sucursal.direccion}</p>
            <p><strong>Teléfono:</strong> {sucursal.numero_telefonico}</p>

            <h4 className="mt-3">Empleados</h4>
            {sucursal.empleados.length === 0 ? (
              <p>No hay empleados en esta sucursal.</p>
            ) : (
              <table className="empleados-lista">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="empleados-caracteristicas text-center">
                  {sucursal.empleados.map((emp) => (
                    <tr key={emp.id}>
                      <td className="empleado-elemento-admin">{emp.id}</td>
                      <td className="empleado-elemento-admin">{emp.nombre}</td>
                      <td className="empleado-elemento-admin">{emp.rol}</td>
                      <td className="empleado-elemento-admin">{emp.estado_usuario}</td>
                      <td className="empleado-elemento-admin">
                        <button
                          className="botones-control-admin-deshabilitar"
                          onClick={() =>
                            cambiarEstadoEmpleado(emp.id, emp.estado_usuario)
                          }
                        >
                          {emp.estado_usuario === "INACTIVO"
                            ? "Habilitar"
                            : "Deshabilitar"}
                        </button>
                        <button
                          className="botones-control-admin-modificar"
                          onClick={() => {
                            setEditando(emp.id);
                            setForm({
                              rol: emp.rol,
                              sucursal_id: emp.sucursal_id || sucursal.id,
                            });
                          }}
                        >
                          Modificar
                        </button>

                        {editando === emp.id && (
                          <div style={{ marginTop: "10px" }}>
                            <input
                              type="text"
                              placeholder="Nuevo rol"
                              value={form.rol}
                              onChange={(e) =>
                                setForm({ ...form, rol: e.target.value })
                              }
                            />
                            <input
                              type="number"
                              placeholder="ID nueva sucursal"
                              value={form.sucursal_id}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  sucursal_id: e.target.value,
                                })
                              }
                            />
                            <button onClick={() => guardarCambios(emp.id)}>
                              Guardar
                            </button>
                            <button onClick={() => setEditando(null)}>
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}