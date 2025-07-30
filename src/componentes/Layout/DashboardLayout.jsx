import { Outlet } from 'react-router-dom';
import Navbar from '../ui/Navbar';
import Footer from '../ui/Footer';
import Menu from '../ui/Menu';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Botón y menú offcanvas */}
      <Menu />

      {/* Contenido principal */}
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}