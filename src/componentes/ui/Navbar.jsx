import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useSucursal } from '../../context/SucursalContext';
import logo from '../../assets/LogoMarcel1.jpeg';
import titulo from '../../assets/TituloMarcel1.jpeg';

export default function Navbar({ onLogout }) {
  const { sucursal, setSucursal } = useSucursal() || {};


  const navigate = useNavigate();
  const { user } = useAuth();

  const Salir = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('sucursal');
    localStorage.removeItem('sucursal.id')
    if (onLogout) onLogout();
    navigate('/seleccionar-sucursal'); // Redirige a la página principal ("/")
  };
  console.log("user:", user);
  console.log("user.rol:", user?.rol);

  if (!sucursal) {
    return <p>Cargando sucursal...</p>; // o estado previo
  }

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="navbar-barra container-fluid">
        <a className="px-3 navbar-brand" href="/">
          <img
            src={logo}
            alt="Logo de Marcel"
            width="60"
            height="auto"
            className="pt-1 d-inline-block align-top"
          />
          <img
            src={titulo}
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
              <Link className="nav-link" to={`/sucursales/${sucursal.id}`}>{sucursal.nombre}</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Ayuda</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Soporte</a>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-link">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link to="/catalogo" className="nav-link">Catalogo</Link>
            </li>
                        <li className='nav-item dropdown'>
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Acciones
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/retomar-verificacion">Retomar Verificacion</a></li>  
                <li><a className="dropdown-item" href="#">Verificar Identidad</a></li>
                <li><a className="dropdown-item" href="#">Historial de Consultas</a></li>
              </ul>
            </li>
            {user && ["GERENTE", "ADMIN", "SOPORTE"].includes((user.rol || "").toUpperCase()) && (
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
                  <li className='text-center'> <strong>Gerencia</strong></li>
                  <li><a className="dropdown-item" href="#">Usuarios</a></li>
                  <li><a className='dropdown-item' href='/historial-verificaciones'>Historial de Verificaciones</a></li>
                  <li><a className="dropdown-item" href="#">Otras sucursales</a></li>
                  <li><a className="dropdown-item" href="/registro">Registrar Empleado</a></li>
                  <li><a className="dropdown-item" href="#">Registrar Dispositivos</a></li>
                  {["ADMIN"].includes((user.rol || "").toUpperCase()) && (
                    <>
                      <li className='text-center'> <strong>Administracion</strong></li>
                      <li><Link to='/registrar-gerente' className='dropdown-item'> Registrar Gerente</Link></li>
                      <li><Link to='/deshabilitar-empleados' className='dropdown-item'>Deshabilitar Empleado </Link></li>
                      <li>
                        <Link to="/registrar-modelo" className='dropdown-item registrar-modelo-nav-item '>Registrar Modelo</Link>
                      </li>
                    </>
                  )}
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