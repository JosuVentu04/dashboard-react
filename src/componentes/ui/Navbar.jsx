import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';


export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const Salir = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login'); // Redirige a la página principal ("/")
  };
  console.log("user:", user);
  console.log("user.rol:", user?.rol);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="navbar-barra container-fluid">
        <a className="px-3 navbar-brand" href="/">
          <img
            src="/LogoMarcel1.jpeg"
            alt="Logo de Marcel"
            width="60"
            height="auto"
            className="pt-1 d-inline-block align-top"
          />
          <img
            src="/TituloMarcel1.jpeg"
            alt="Titulo de marcel"
            width="280"
            height="auto"
            className="ps-2 d-inline-block align-top"
          />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#">Ayuda</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Soporte</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Inventario</a>
            </li>
            {user && user.rol === 'GERENTE' && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Gestion
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">Usuarios</a></li>
                  <li><a className="dropdown-item" href="#">Empleados</a></li>
                  <li><a className="dropdown-item" href="#">Otras sucursales</a></li>
                  <li><a className="dropdown-item" href="/registro">Crear empleado</a></li>
                  <li><a className="dropdown-item" href="#">Registrar Dispositivos</a></li>
                  <li><a className="dropdown-item" href="#">Gestionar Tienda</a></li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <div className="btn-group">
                <button
                  className="btn-cuenta"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-circle-user fa-3x"></i>
                </button>
                <ul className="dropdown-menu" style={{ top: '100%', left: '-50px' }}>
                  <li><Link to="/mi-perfil" className="dropdown-item">Perfil</Link></li>
                  <li>
                    <button
                      className="perfil-btn dropdown-item btn btn-outline-danger"
                      onClick={Salir}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}