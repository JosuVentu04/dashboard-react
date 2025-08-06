export default function Catalogo() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">  {/* Contenedor padre para el navbar */}

        <div className="row w-100 align-items-center"> {/* Fila con ancho completo y centrado vertical */}

          <div className="col-9">

            {/* Contenedor con scroll horizontal */}
            <div
              className="navbar-nav-wrapper"
              style={{
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              <ul
                className="navbar-nav"
                style={{
                  flexWrap: 'nowrap',
                  display: 'flex',
                  gap: '1rem', // separación entre ítems
                }}
              >
                {/* Items de menú */}
                <li className="nav-item">
                  <a className="nav-link" href="#">Samsung</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Xiaomi</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Huawei</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Honor</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Motorola</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Iphone</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">OPPO</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">ZTE</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-3">
            <div className="row">
              <form className="d-flex">
                <div className="col-8">
                  <input
                    className="form-control w-100"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                  />
                </div>
                <div className="col-5">
                  <button className="btn-barra-busqueda-catalogo" type="submit">
                  Search
                </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </nav>
  );
}
