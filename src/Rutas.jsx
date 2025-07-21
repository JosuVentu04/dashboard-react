import { Routes, Route } from 'react-router-dom';
import Home         from './Home';
import LoginForm    from './componentes/Login';
import RegisterForm from './componentes/Registro';

export default function Rutas() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      {/* 404 */}
      <Route path="*" element={<h1 className="text-center mt-5">404 – Página no encontrada</h1>} />
    </Routes>
  );
}