import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './componentes/Login'
import Registro from './componentes/Registro'
import ConfirmarEmail from './paginas/ConfirmarEmail';
import PaginaInicio from './componentes/PaginaInicio';
import DashboardLayout from './componentes/Layout/DashboardLayout';
import RequireAuth from './componentes/RequireAuth';
import Perfil from './componentes/Perfil';
import Catalogo from './componentes/Catalogo';
import SelectorSucursal from './componentes/SelectorSucursales';
import InformacionSucursal from './componentes/InformacionSucursal';
import ModeloDetalle from './paginas/ModeloDetalle';
import { PrivateRoute } from './context/RutasPrivadas';
import RegistrarModelo from './componentes/Admin/RegistrarModelo';
import EditarModelo from './componentes/Admin/EditarModelo';
import RegistrarGerente from './componentes/Admin/RegistrarGerente';
import DeshabilitarEmpleado from './componentes/Admin/DeshabilitarEmpleado';
import VeriffQR from './componentes/verificacion/verificacion';
import QRPage from './componentes/verificacion/UseQuery';
import VerificacionPollingWrapper from './componentes/verificacion/VerificacionPollingWrappe';
import CapturaPage from './componentes/verificacion/PaginaCaptura';
import VerificacionCompletada from './componentes/verificacion/VerificacionCompletada';
import VerificacionErronea from './componentes/verificacion/VerificacionErronea';
import HistorialVerificaciones from './componentes/Gerente/HistorialVerificaciones';
import HmacExample from './componentes/pruebas/PruebaFirma';


export default function Rutas() {
  return (
    <Routes className="Rutas">
      <Route path="/seleccionar-sucursal" element={<SelectorSucursal />} />
      <Route path="/sucursales/:sucursalId/login" element={<Login />} />
      <Route path="/confirmar-correo/:token" element={<ConfirmarEmail />} />
      <Route path="/correo-verificado" element={<ConfirmarEmail />} />
      <Route element={<RequireAuth>
        <DashboardLayout />
      </RequireAuth>}>
        <Route path='/sucursales/:sucursalId' element={<InformacionSucursal />}></Route>
        <Route path="/" element={<PaginaInicio />} />
        <Route path='/confirmar-email-antiguo/:token' element={<ConfirmarEmail />}></Route>
        <Route path='/confirmar-email-nuevo/:token' element={<ConfirmarEmail />}></Route>
        <Route element={<PrivateRoute allowedRoles={["GERENTE", "ADMIN", "SOPORTE"]} />}>
          <Route path="/registro" element={<Registro />} />
          <Route path='/historial-verificaciones' element={<HistorialVerificaciones/>}></Route>
        </Route> 
        <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
          <Route path='/registrar-modelo' element={<RegistrarModelo />}></Route>
          <Route path='/editar-modelo/:id' element={<EditarModelo/>}></Route>
          <Route path='/registrar-gerente' element={<RegistrarGerente/>}></Route>
          <Route path='/deshabilitar-empleados' element={<DeshabilitarEmpleado/>}></Route>
        </Route>
        <Route path='/mi-perfil' element={<Perfil />}></Route>
        <Route path='/catalogo' element={<Catalogo />}></Route>
        <Route path="/catalogo/modelo/:id" element={<ModeloDetalle />} />
        <Route path="/pruebaveriff" element={<VeriffQR/>}></Route>
        <Route path="/qr" element={<QRPage />} />
        <Route path="/captura" element={<CapturaPage />} />
        <Route path="/polling" element={<VerificacionPollingWrapper />} />
        <Route path="/verificacion-completa" element={<VerificacionCompletada/>}></Route>
        <Route path='/verificacion-erronea' element={<VerificacionErronea/>}></Route>
        <Route path='/prueba-firma' element={<HmacExample/>}></Route>
      </Route>
      <Route path="*" element={<h1 className="text-center mt-5">404 – Esta no es la pagina que estas buscando</h1>} />
    </Routes>
  );
}

