import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './componentes/Login'
import Registro from './componentes/Registro'
import ConfirmarEmail from './paginas/ConfirmarEmail';
import PaginaInicio from './componentes/PaginaInicio';
import DashboardLayout from './componentes/Layout/DashboardLayout';
import RequireAuth from './componentes/RequireAuth';
import Perfil from './componentes/Perfil';



export default function Rutas() {
  return (
    <Routes className="Rutas">
      <Route path="/login" element={<Login />} />
      <Route path="/confirmar-correo/:token" element={<ConfirmarEmail />} />
      <Route path="/correo-verificado" element={<ConfirmarEmail />} />
      <Route element={<RequireAuth>
        <DashboardLayout />
      </RequireAuth>}>
        <Route path="/" element={<PaginaInicio />} />
        <Route path='/confirmar-email-antiguo/:token' element={<ConfirmarEmail/>}></Route>
        <Route path='/confirmar-email-nuevo/:token' element={<ConfirmarEmail/>}></Route>
        <Route path="/registro" element={<Registro />} />
        <Route path='/mi-perfil' element={<Perfil/>}></Route>
      </Route>
      <Route path="*" element={<h1 className="text-center mt-5">404 – Esta no es la pagina que estas buscando</h1>} />
    </Routes>
  );
}

