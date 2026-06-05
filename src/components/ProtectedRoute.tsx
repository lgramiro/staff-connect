import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading, activeRole, userRoles } = useAuth();

  if (loading) {
    return null; // Don't show anything during initial load to prevent flicker
  }

  if (!session) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (profile?.is_blocked) {
    return <Navigate to="/auth?mode=login&blocked=true" replace />;
  }

  // For multi-role/master users: check if activeRole is allowed,
  // but also allow access if user HAS the required role in their userRoles
  if (allowedRoles) {
    if (activeRole && allowedRoles.includes(activeRole)) {
      return <>{children}</>;
    }
    // Check if user has any of the allowed roles (master user support)
    const hasAllowedRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasAllowedRole) {
      // Redirect to their active role's dashboard
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        estabelecimento: "/app/estabelecimento",
        profissional: "/app/profissional",
      };
      return <Navigate to={activeRole ? roleRoutes[activeRole] : "/escolher-perfil"} replace />;
    }
  }

  return <>{children}</>;
};
