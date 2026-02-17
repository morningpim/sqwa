import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function GuestGuard({ children }) {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn)
    return <Navigate to="/" replace />;

  return children;
}
