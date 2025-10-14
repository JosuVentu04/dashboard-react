import { Outlet } from 'react-router-dom';
import Navbar from '../ui/Navbar';
import Footer from '../ui/Footer';


export default function DashboardLayout() {
  return (
    <div className="dashboard-layout d-flex flex-column min-vh-100 pb-1">
      {/* Top navigation */}
      <Navbar />

      {/* Offcanvas menu (puede estar fijo o activado por botón) */}

      {/* Main content area grows to fill space */}
      <main className="flex-grow-1 main-content">
        <Outlet />
      </main>

      {/* Footer at the very bottom */}
      <Footer />
    </div>
  );
}