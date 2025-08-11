import { useAuth } from "./AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes((user.rol || "").toUpperCase()))
    return <Navigate to="/not-authorized" />;

  return <Outlet />;
}