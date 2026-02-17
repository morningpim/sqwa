import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }) {
  const { me } = useAuth();
  if (!me) return <Navigate to="/login" replace />;
  return children;
}
