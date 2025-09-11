import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // 👈 para usar api

export default function ModeloDetalle() {
  const { id } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();
  

  const [modelo, setModelo] = useState(null);
  const [error, setError] = useState(null);

  // 🔹 Obtener los datos con api.get
  useEffect(() => {
    if (!id) return; // no hacer request si no hay ID

    api
      .get(`/devices/catalogo-modelos/${id}`)
      .then((res) => {
        setModelo(res.data);
      })
      .catch(() => {
        setError("No se pudo cargar el dispositivo.");
      });
  }, [id, api]);

  // 🔹 Eliminar modelo
  const eliminarModelo = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este modelo?")) return;

    try {
      await api.delete(`/devices/eliminar-modelo/${id}`);
      alert("Modelo eliminado correctamente");
      navigate("/catalogo"); // Redirigir al catálogo
    } catch (err) {
      console.error("Error al eliminar modelo", err);
      alert(
        err.response?.data?.msg || "Error al eliminar el modelo"
      );
    }
  };

  if (error) return <div>{error}</div>;
  if (!modelo) return <div>Cargando...</div>;

  return (
    <div className="container mt-4" style={{ background: "white" }}>
      <div className="row">
        <div className="row">
          <div className="col-11">
            <h2 className="text-center">
              {modelo.marca} {modelo.modelo}
            </h2>
          </div>
          <div className="iconos-modelo col-1">
            {/* Solo mostrar si el usuario tiene permisos */}
            {user &&
              ["ADMIN", "SOPORTE"].includes(
                (user.rol || "").toUpperCase()
              ) && (
                <>
                  <Link
                    className="icono-editar-modelo"
                    to={`/editar-modelo/${modelo.id}`}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Link>
                  <button
                    className="icono-eliminar-modelo"
                    onClick={eliminarModelo}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </>
              )}
          </div>
        </div>

        <div className="col-md-6">
          {modelo.imagen ? (
            <img
              src={modelo.imagen}
              alt={`${modelo.marca} ${modelo.modelo}`}
              style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{ height: 350, backgroundColor: "#eee" }}
              className="d-flex justify-content-center align-items-center"
            >
              Sin imagen
            </div>
          )}
          <p
            style={{ fontSize: "20px" }}
            className="pt-3 list-group-item"
          >
            {modelo.descripcion}
          </p>
        </div>

        {/* Datos técnicos */}
        <div className="col-md-6">
          <ul className="list-group mb-3">
            <li className="list-group-item">
              <strong>Almacenamiento:</strong> {modelo.almacenamiento}
            </li>
            <li className="list-group-item">
              <strong>RAM:</strong> {modelo.ram}
            </li>
            <li className="list-group-item">
              <strong>Año:</strong> {modelo.anio}
            </li>
            <li className="list-group-item">
              <strong>Color:</strong> {modelo.color || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Dual SIM:</strong> {modelo.dual_sim ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Red móvil:</strong> {modelo.red_movil || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Versión Android:</strong> {modelo.version_android || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Procesador:</strong> {modelo.procesador || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Velocidad procesador:</strong>{" "}
              {modelo.velocidad_procesador || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Cantidad núcleos:</strong>{" "}
              {modelo.cantidad_nucleos || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Tamaño pantalla:</strong>{" "}
              {modelo.tamanio_pantalla || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Tipo resolución:</strong>{" "}
              {modelo.tipo_resolucion || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Frecuencia actualización pantalla:</strong>{" "}
              {modelo.frecuencia_actualizacion_pantalla || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Cámara trasera principal:</strong>{" "}
              {modelo.resolucion_camara_trasera_principal || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Cámara frontal principal:</strong>{" "}
              {modelo.resolucion_camara_frontal_principal || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Batería:</strong> {modelo.capacidad_bateria || "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Carga rápida:</strong>{" "}
              {modelo.carga_rapida ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Huella dactilar:</strong>{" "}
              {modelo.huella_dactilar ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Resistencia a salpicaduras:</strong>{" "}
              {modelo.resistencia_salpicaduras ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Resistencia al agua:</strong>{" "}
              {modelo.resistencia_agua ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Resistencia al polvo:</strong>{" "}
              {modelo.resistencia_polvo ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Resistencia a caídas:</strong>{" "}
              {modelo.resistencia_caidas ? "Sí" : "No"}
            </li>
            <li className="list-group-item">
              <strong>Fecha creación:</strong>{" "}
              {modelo.fecha_creacion
                ? new Date(modelo.fecha_creacion).toLocaleString()
                : "N/A"}
            </li>
            <li className="list-group-item">
              <strong>Fecha actualización:</strong>{" "}
              {modelo.fecha_actualizacion
                ? new Date(modelo.fecha_actualizacion).toLocaleString()
                : "N/A"}
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center">
        <Link
          to="/catalogo"
          className="boton-volver-catalogo mb-5 p-2 btn btn-secondary mt-3"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}