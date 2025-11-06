import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const marcas = [
  "Samsung",
  "Xiaomi",
  "Huawei",
  "Honor",
  "Motorola",
  "Iphone",
  "OPPO",
  "ZTE",
];

export default function Catalogo() {
  const [catalogo, setCatalogo] = useState(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("Todas");
  const [error, setError] = useState(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [busqueda, setBusqueda] = useState(""); // Nuevo estado para la búsqueda

  useEffect(() => {
    setLoadingCatalogo(true);
    setError(null);
    fetch("http://127.0.0.1:5000/devices/catalogo-modelos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar información del catalogo");
        return res.json();
      })
      .then((data) => setCatalogo(data))
      .catch(() => setError("Error cargando información del catalogo"))
      .finally(() => setLoadingCatalogo(false));
  }, []);

  // Función de filtrado combinada
  const filtrarCatalogo = () => {
    if (!catalogo) return [];

    let filtrado = catalogo;

    if (marcaSeleccionada !== "Todas") {
      filtrado = filtrado.filter(
        (modelo) =>
          modelo.marca &&
          modelo.marca.toLowerCase() === marcaSeleccionada.toLowerCase()
      );
    }

    if (busqueda.trim() !== "") {
      filtrado = filtrado.filter((modelo) =>
        [modelo.marca, modelo.modelo, modelo.descripcion]
          .map((s) => (s || "").toLowerCase())
          .some((campo) => campo.includes(busqueda.toLowerCase()))
      );
    }

    return filtrado;
  };

  const catalogoFiltrado = filtrarCatalogo();

  // Maneja el envío del formulario de búsqueda para no recargar la página
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <div className="row w-100 align-items-center">
            <div className="col-9">
              <div
                className="navbar-nav-wrapper"
                style={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                <ul
                  className="navbar-nav"
                  style={{
                    flexWrap: "nowrap",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <li className="nav-item">
                    <button
                      className={`nav-link btn btn-link p-0 ${marcaSeleccionada === "Todas" ? "fw-bold" : ""}`}
                      style={{ background: "none", border: "none" }}
                      onClick={() => setMarcaSeleccionada("Todas")}
                    >
                      Todos
                    </button>
                  </li>
                  {marcas.map((marca) => (
                    <li key={marca} className="nav-item">
                      <button
                        className={`nav-link btn btn-link p-0 ${marcaSeleccionada === marca ? "fw-bold text-primary" : ""}`}
                        style={{ background: "none", border: "none" }}
                        onClick={() => setMarcaSeleccionada(marca)}
                      >
                        {marca}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-3">
              <div className="row">
                <form className="d-flex" onSubmit={handleSubmit}>
                  <div className="col-8">
                    <input
                      className="form-control w-100"
                      type="search"
                      placeholder="Busca marca, modelo o descripción"
                      aria-label="Search"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                  <div className="col-5">
                    <button
                      className="btn-barra-busqueda-catalogo"
                      type="submit"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mt-4">
        {loadingCatalogo && <p>Cargando catálogo...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {catalogoFiltrado && catalogoFiltrado.length === 0 && (
          <p>No hay modelos disponibles para esta búsqueda.</p>
        )}
        {catalogoFiltrado && catalogoFiltrado.length > 0 && (
          <div className="row">
            {catalogoFiltrado.map((modelo) => (
              <div key={modelo.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  {modelo.imagen ? (
                    <img
                      src={modelo.imagen}
                      style={{ height: 350 }}
                      className="card-img-top"
                      alt={`${modelo.marca} ${modelo.modelo}`}
                    />
                  ) : (
                    <div
                      style={{ height: 350, backgroundColor: "#ddd" }}
                      className="d-flex justify-content-center align-items-center"
                    >
                      <span>Sin imagen</span>
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">
                      {modelo.marca} {modelo.modelo}
                    </h5>
                    <p className="card-text">
                      <strong>Precio:</strong> {modelo.precio} MXN <br />
                      <strong>Almacenamiento:</strong> {modelo.almacenamiento} <br />
                      <strong>RAM:</strong> {modelo.ram} <br />
                      <strong>Año:</strong> {modelo.anio}
                    </p>
                    <p className="card-text">
                      <small className="descripcion-catalogo text-muted">{modelo.descripcion}</small>
                    </p>
                    <div className="botones-catalogo text-center">
                      <Link to={`/catalogo/modelo/${modelo.id}`} className="btn catalogo-informacion">Saber mas</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
