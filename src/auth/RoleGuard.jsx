import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function AdminGuard({ children }) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!me)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (me.role !== "admin")
    return <Navigate to="/" replace />;

  return children;
}
