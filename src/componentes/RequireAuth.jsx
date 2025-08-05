import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Ojo: aquí podrías mostrar un spinner en vez de null
    return null;
  }

  if (!user) {
    return <Navigate to="/seleccionar-sucursal" state={{ from: location }} replace />;
  }

  return children;
}