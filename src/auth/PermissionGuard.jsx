export default function PermissionGuard({ allow, role, children }) {
  if (!allow.includes(role)) return null;
  return children;
}
