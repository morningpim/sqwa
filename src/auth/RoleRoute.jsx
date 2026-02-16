import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({ allow, children }) {
  const { user } = useAuth();

  if (!allow.includes(user?.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
