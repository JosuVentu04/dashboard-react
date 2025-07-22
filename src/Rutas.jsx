import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './componentes/Login'
import Registro from './componentes/Registro'

export default function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/registro" element={<Registro/>}/>
      <Route path="*" element={<h1 className="text-center mt-5">404 – Página no encontrada</h1>} />
    </Routes>
  );
}