import { useAuth } from "../auth/AuthProvider";

export default function RoleGuard({ allow, children }) {
  const { me } = useAuth();

  if (!me || !allow.includes(me.role))
    return <div>Permission denied</div>;

  return children;
}
