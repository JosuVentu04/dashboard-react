import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón para abrir/cerrar */}


      {/* Menú lateral */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li className='Sidebar-opciones'><Link className=" sidebar-btn " to="/dashboard">Inventario</Link></li>
            <li className='Sidebar-opciones'><Link className=" sidebar-btn " to="/ventas">Ventas</Link></li>
            <li className='Sidebar-opciones'><Link className=" sidebar-btn " to="/clientes">Clientes</Link></li>
            <li className='Sidebar-opciones'><Link className=" sidebar-btn " to="/reportes">Reportes</Link></li>
          </ul>
          <button onClick={toggleMenu} className="sidebar-toggle-btn">
            {isOpen ? <i className="fa-solid fa-arrow-left"></i> : <i className="fa-solid fa-arrow-right"></i>}
          </button>
        </nav>
      </div>

      {/* Capa oscura detrás */}
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
}
