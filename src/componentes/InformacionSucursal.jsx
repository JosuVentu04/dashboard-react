import { useSucursal } from "../context/SucursalContext";
import { useEffect, useState } from "react";

export default function InformacionSucursal() {
  const { sucursal } = useSucursal();

  const [sucursalInfo, setSucursalInfo] = useState(null);
  const [empleados, setEmpleados] = useState([]);

  const [error, setError] = useState(null);
  const [loadingSucursal, setLoadingSucursal] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  useEffect(() => {
    if (!sucursal?.id) return;

    // Cargar información de la sucursal
    setLoadingSucursal(true);
    setError(null);
    fetch(`https://didactic-space-acorn-v6qxr47wv9gxhxv64-5000.app.github.dev/sucursales/${sucursal.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar información de la sucursal");
        return res.json();
      })
      .then((data) => setSucursalInfo(data))
      .catch(() => setError("Error cargando información de la sucursal"))
      .finally(() => setLoadingSucursal(false));

    // Cargar empleados de la sucursal
    setLoadingEmpleados(true);
    fetch(`https://didactic-space-acorn-v6qxr47wv9gxhxv64-5000.app.github.dev/empleados?sucursal_id=${sucursal.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar empleados");
        return res.json();
      })
      .then((data) => setEmpleados(data))
      .catch(() => setError("Error cargando empleados"))
      .finally(() => setLoadingEmpleados(false));
  }, [sucursal]);

  if (loadingSucursal) return <p>Cargando sucursal...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!sucursalInfo) return <p>Selecciona una sucursal</p>;

  return (
    <div className=" container py-3">
      <div className="row">
        <div className="col-2"></div>
        <div className="col-8 mt-3 p-3 informacion-sucursal">
          <h1 className="text-center">{sucursalInfo.nombre}</h1>
          <div className="apartado-informacion-sucursal">
            <p><strong>Id Sucursal:</strong> {sucursalInfo.id}</p>
            <p><strong>Estado:</strong> {sucursalInfo.estado_sucursal}</p>
            <p><strong>Dirección:</strong> {sucursalInfo.direccion}</p>
            <p><strong>Numero Telefonico:</strong> {sucursalInfo.numero_telefonico}</p>
          </div>
          <h1 className="my-3 text-center">Empleados</h1>
          <div className="apartado-informacion-empleados">
            {loadingEmpleados ? (
              <p>Cargando empleados...</p>
            ) : empleados.length === 0 ? (
              <p>No hay empleados para esta sucursal.</p>
            ) : (
              <table className="empleados-lista">
                <thead>
                  <tr>
                    <th>Id Empleado</th>
                    <th>Nombre Empleado</th>
                    <th>Cargo</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {empleados.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.nombre}</td>
                      <td>{e.rol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}