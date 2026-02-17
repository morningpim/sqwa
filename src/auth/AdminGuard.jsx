import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role !== "admin")
    return <Navigate to="/" replace />;

  return children;
}
