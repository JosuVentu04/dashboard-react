import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './componentes/Login'
import Registro from './componentes/Registro'
import ConfirmarEmail from './paginas/ConfirmarEmail';
import Landing from './componentes/Landing';


export default function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/registro" element={<Registro/>}/>
      <Route path="/confirmar-correo/:token" element={<ConfirmarEmail />} />
      <Route path="/correo-verificado" element={<ConfirmarEmail />} />
      <Route path='/landing' element={<Landing/>}></Route>
      <Route path="*" element={<h1 className="text-center mt-5">404 – Página no encontrada</h1>} />
    </Routes>
  );
}

